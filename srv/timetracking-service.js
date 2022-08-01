const uuid = require("uuid");
const cds = require("@sap/cds");

// Test gitmoji 2
require("dotenv").config();

// Helper method for using SQLite: the CDS-adapter does not allow recursive CTEs. Thus we talk to SQLite3 directly
// REVISIT: Remove as soon as the CDS-adapter supports recursive selects
const readFromSQLite = (query) => {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  const sqlite3 = require("sqlite3");
  const sqliteDB = new sqlite3.Database("./sqlite.db", sqlite3.OPEN_READONLY);

  return new Promise((resolve, reject) => {
    sqliteDB.all(query, (error, results) => {
      if (error != null) {
        reject(error);
      }

      resolve(results);
      sqliteDB.close();
    });
  });
};

function transformEventToWorkItem({
  id,
  subject,
  start,
  end,
  // categories: [customer_friendlyID],
  sensitivity,
  isAllDay,
  user,
}) {
  return {
    ID: id,
    title: subject,
    // customer_friendlyID,
    /*
      The original format is: '2022-06-23T14:30:00.0000000'
      OData needs a format like this: '2022-06-23T00:00:00Z'

      All-Day events show the wrong times and are a couple of hours off (02:00 instead of 00:00).
      This leads to UI5 showing repeating them each single day instead of showing all-day events.
      Thus we replace the time for all-day events
      */
    activatedDate: isAllDay
      ? `${start.dateTime.substring(0, 11)}00:00:00Z`
      : `${start.dateTime.substring(0, 19)}Z`,
    completedDate: isAllDay
      ? `${end.dateTime.substring(0, 11)}00:00:00Z`
      : `${end.dateTime.substring(0, 19)}Z`,
    assignedTo_userPrincipalName: user,
    private: sensitivity === "private",
    isAllDay,
    type: "Event",
  };
}

function calcDurationInH({ start, end }) {
  const durationInMS = new Date(end) - new Date(start);
  const durationInH = durationInMS / 1000 / 60 / 60;
  const durationInHRounded = durationInH.toFixed(2);
  return durationInHRounded;
}

function calcDates({ activatedDate, completedDate }) {
  const aDate = new Date(activatedDate);
  const cDate = new Date(completedDate);
  return {
    activatedDateMonth: aDate.getUTCMonth() + 1,
    activatedDateYear: aDate.getUTCFullYear(),
    activatedDateDay: aDate.getUTCDate(),
    completedDateMonth: cDate.getUTCMonth() + 1,
    completedDateYear: cDate.getUTCFullYear(),
    completedDateDay: cDate.getUTCDate(),
  };
}

// eslint-disable-next-line func-names
module.exports = cds.service.impl(async function () {
  const db = await cds.connect.to("db");
  const MSGraphSrv = await cds.connect.to("MSGraphService");
  // const AzDevOpsSrv = await cds.connect.to("AzureDevopsService");
  const { Categories, Users, WorkItems } = db.entities("iot.planner");

  // REVISIT: comparator dependent on DB-type
  const comparator = db.kind === "sqlite" ? "=" : "ilike";

  this.on("READ", "MyCategories", async (req) => {
    // Recursive CTE that returns descendants and ancestors of the categories that have been mapped to users, see https://stackoverflow.com/questions/17074950/recursive-cte-sql-to-return-all-decendants-and-ancestors
    // The hierarchical data is stored as an adjacent list, see https://www.databasestar.com/hierarchical-data-sql/#c2
    // Note: Recursive CTE's are not supported by HANA!: https://stackoverflow.com/questions/58090731/how-to-implement-recursion-in-hana-query
    // TODO: Make it work on SQLite
    /* 
      childrenCTE: get all children of the categories, that have been assigned to my user via the n-m mapping table of iot_planner_Users2Categories 
      parentCTE: get all parents of my categories
      pathCTE: concat the titles along a path of the tree (from root) into a field named 'path'
      */
    const recursiveQuery = `WITH RECURSIVE 
    childrenCTE AS (
      SELECT cat.ID, cat.title, cat.description, cat.parent_ID, cat.hierarchyLevel 
      FROM iot_planner_Categories AS cat
      INNER JOIN iot_planner_Users2Categories as user2cat
        on cat.ID = user2cat.category_ID
        and user2cat.user_userPrincipalName ${comparator} '${req.user.id}'
      UNION 
      SELECT this.ID, this.title, this.description, this.parent_ID, this.hierarchyLevel
      FROM childrenCTE AS parent 
      INNER JOIN iot_planner_Categories AS this 
          ON this.parent_ID = parent.ID
      ),
    parentCTE AS (
      SELECT cat.ID, cat.title, cat.description, cat.parent_ID, cat.hierarchyLevel 
      FROM iot_planner_Categories AS cat
      INNER JOIN iot_planner_Users2Categories as user2cat
        on cat.ID = user2cat.category_ID
        and user2cat.user_userPrincipalName ${comparator} '${req.user.id}'
      UNION 
      SELECT this.ID, this.title, this.description, this.parent_ID, this.hierarchyLevel
      FROM parentCTE AS children 
      INNER JOIN iot_planner_Categories AS this 
          ON children.parent_ID = this.ID
      ),
    pathCTE AS (
      SELECT cat.ID, cat.title, cat.parent_ID, cat.title as path
      FROM iot_planner_Categories AS cat
      WHERE cat.parent_ID IS NULL
      UNION 
      SELECT this.ID, this.title, this.parent_ID, CAST((prior.path || ' > ' || this.title) as varchar(5000)) as path 
      FROM pathCTE AS prior 
      INNER JOIN iot_planner_Categories AS this 
          ON this.parent_ID = prior.ID
    )
    SELECT * 
    FROM pathCTE
    JOIN childrenCTE on pathCTE.ID = childrenCTE.ID
    UNION
    SELECT * 
    FROM pathCTE
    JOIN parentCTE on pathCTE.ID = parentCTE.ID
    ORDER BY hierarchyLevel ASC;`;

    // Helper method for using SQLite: the CDS-adapter does not allow recursive CTEs. Thus we talk to SQLite3 directly
    // REVISIT: Remove as soon as the CDS-adapter supports recursive selects
    const results =
      db.kind === "sqlite"
        ? await readFromSQLite(recursiveQuery)
        : await db.run(recursiveQuery);

    const categories = results.map(
      ({ id, parent_id, hierarchylevel, ...data }) => ({
        ID: id,
        parent_ID: parent_id,
        hierarchyLevel: hierarchylevel,
        ...data,
      })
    );
    return categories;
  });

  this.on("READ", "MyUser", async (req) => {
    const tx = this.transaction(req);
    const details = await tx.run(
      SELECT.from(Users).where({ userPrincipalName: req.user.id })
    );

    return details;
  });

  this.on("DELETE", "MyWorkItems", async (req) => {
    const item = req.data;
    const tx = this.transaction(req);
    const [entries, dummyCategories] = await Promise.all([
      this.read(WorkItems).where({ ID: item.ID }),
      this.read(Categories).where({ title: "DELETED" }),
    ]);

    if (dummyCategories.length !== 1)
      throw Error(
        "Dummy-category not found (needed for referential integrity of the workitem that is marked to be deleted)."
      );

    if (entries.length > 0)
      await tx.run(DELETE.from(WorkItems).where({ ID: item.ID }));

    await tx.run(
      INSERT.into(WorkItems).entries({
        ID: item.ID,
        deleted: true,
        assignedTo_userPrincipalName: "DELETED",
        hierarchy_parent: dummyCategories[0].ID,
      })
    );
  });

  this.on("UPDATE", "MyWorkItems", async (req) => {
    const item = req.data;
    const tx = this.transaction(req);

    if (item.resetEntry) {
      // RESET
      if (item.type !== "Manual")
        throw Error("Reset is not allowed for entries of type 'Manual'");

      // eslint-disable-next-line no-unused-vars
      const { customer_friendlyID, project_friendlyID, ...reducedItem } = item;

      await tx.run(DELETE.from(WorkItems).where({ ID: item.ID }));

      return item.type === "Manual" ? { ID: item.ID } : reducedItem;
    }

    const [entries, dummyCategories] = await Promise.all([
      this.read(WorkItems).where({ ID: item.ID }),
      this.read(Categories).where({ title: "DELETED" }),
    ]);

    if (dummyCategories.length !== 1)
      throw Error(
        "Dummy-category not found (needed for referential integrity of the workitem that is marked to be deleted)."
      );

    if (item.deleted) {
      // DELETE
      if (entries.length > 0) {
        await tx.run(DELETE.from(WorkItems).where({ ID: item.ID }));
      } else {
        await tx.run(
          INSERT.into(WorkItems).entries({
            ID: item.ID,
            deleted: true,
            assignedTo_userPrincipalName: req.user.id,
            hierarchy_parent: dummyCategories[0].ID,
          })
        );
      }

      return item;
    }

    // UPDATE
    item.confirmed = true;
    item.duration = calcDurationInH({
      start: item.activatedDate,
      end: item.completedDate,
    });

    const dates = calcDates(item);
    Object.assign(item, dates);

    let itm = item;

    if (entries.length === 0) {
      itm = await tx.run(INSERT.into(WorkItems).entries(item));
    } else {
      itm = await tx.run(UPDATE(WorkItems, item.ID).with(item));
    }

    return itm;
  });

  this.on("CREATE", "MyWorkItems", async (req, next) => {
    // Create a V4 UUID (=> https://github.com/uuidjs/uuid#uuidv5name-namespace-buffer-offset)
    req.data.ID = uuid.v4();
    req.data.type = "Manual";
    req.data.confirmed = true;
    req.data.duration = calcDurationInH({
      start: req.data.activatedDate,
      end: req.data.completedDate,
    });
    req.data.assignedTo_userPrincipalName = req.user.id;

    const dates = calcDates(req.data);
    Object.assign(req.data, dates);

    return next();
  });

  this.on("READ", "MyWorkItems", async (req) => {
    const {
      query: {
        SELECT: { where = "ID != null", columns, orderBy, limit },
      },
    } = req;

    const [devOpsWorkItems, MSGraphEvents, localWorkItems, myCategories] =
      await Promise.all([
        // AzDevOpsSrv.tx(req)
        //   .read("WorkItems", columns)
        //   .where(where)
        //   .orderBy(orderBy)
        //   .limit(limit),
        [],
        // [],
        // TODO: Breaks if no startdatetime and enddatetime are provided: Fix it!
        MSGraphSrv.tx(req)
          .read("Events", "*")
          .where(where)
          .orderBy(orderBy)
          .limit(limit),
        cds.run(req.query),
        this.run(SELECT.from("MyCategories")),
      ]);

    const MSGraphWorkItems = MSGraphEvents.map((event) =>
      transformEventToWorkItem({
        ...event,
        user: req.user.id,
        categories: myCategories,
      })
    );

    // Reihenfolge ist wichtig (bei gleicher ID wird erstes mit letzterem überschrieben)
    // TODO: Durch explizite Sortierung absichern.
    const map = [
      ...devOpsWorkItems.map((itm) => ({ ...itm, confirmed: false })),
      ...MSGraphWorkItems.map((itm) => ({ ...itm, confirmed: false })),
      ...localWorkItems.map((itm) => ({ ...itm, confirmed: true })),
    ]
      // .reduce((acc, item) => acc.concat(item), [])
      /*
        Nur Items mit ID und AssignedTo übernehmen
        => Verhindert, dass lokale Ergänzungen geladen werden, die in MSGraph oder DevOps gelöscht wurden
        */
      .filter((itm) => itm)
      .filter(({ ID, completedDate }) => !!ID && !!completedDate)
      .reduce((acc, curr) => {
        // Der Parent-Path kann nicht per join oder Assoziation ermittelt werden, da es sich bei der Selektion der Kategorien und der entsprechenden Pfade um eine custom-implementation handelt. Lösung: Alle myCategories laden und manuell zuordnen
        const parent = myCategories.find(({ ID }) => ID === curr.parent_ID);
        const accUpdt = {
          ...acc,
          [curr.ID]: { ...curr, parentPath: parent?.path },
        };
        return accUpdt;
      }, {});

    const results = Object.values(map).filter(({ deleted }) => !deleted);

    const srv = this;

    // TODO: Schleifen-basierte SQL-Abfragen ersetzen
    // async function addExtraInfosTo(workItems) {
    //   const [categories, tags2Categories, ] = await Promise.all(
    //     srv.read(Categories),
    //     srv.read(Tags)
    //   );

    //   workItems.filter(item => !!item.title).forEach(item => {
    //     const titleSubstrings = item.title.split(" ");

    //     if (!item.customer_ID) {
    //       const query = [titleSubstrings, item.customer_friendlyID]
    //         .map((sub) => `friendlyID like '%${sub}%' or name like '%${sub}'`)
    //         .join(" OR ");

    //       if (customer) {
    //         item.customer_ID = customer.ID;
    //       }
    //     }

    //     if (!item.project_ID) {
    //       const query = titleSubstrings
    //         .map((sub) => `friendlyID like '%${sub}%' or title like '%${sub}'`)
    //         .join(" OR ");

    //       const [project] = await srv.read(Projects).where(query);

    //       if (project) {
    //         item.project_ID = project.ID;
    //       }
    //     }
    //   })
    // }

    // await addExtraInfosTo(results);

    results.$count = results.length;
    return results;
  });
});
