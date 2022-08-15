const uuid = require("uuid");
const cds = require("@sap/cds");
const fs = require("fs");
const path = require("path");
const stringSimilarity = require("string-similarity");
const levenary = require("levenary");

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
  categories,
  sensitivity,
  isAllDay,
  user,
}) {
  return {
    ID: id,
    title: subject.replace(/ #\w\w+\s?/g, ""),
    tags: categories
      .concat(
        subject
          .split(" ")
          .filter((v) => v.startsWith("#"))
          .map((x) => x.substr(1))
      )
      .map((tag_title) => ({
        tag_title,
      })),
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
  // const comparator = db.kind === "sqlite" ? "=" : "ilike";

  this.on("READ", "MyCategories", async (req) => {
    // Helper method for using SQLite: the CDS-adapter does not allow recursive CTEs. Thus we talk to SQLite3 directly
    // REVISIT: Remove as soon as the CDS-adapter supports recursive selects
    const results =
      // db.kind === "sqlite"
      //   ? await readFromSQLite(query)
      //   :
      await db.run(
        SELECT.from("iot_planner_my_categories")
          .where`user_userPrincipalName = ${req.user.id} and tenant = ${req.user.tenant}`
      );

    const categories = results.map(
      ({
        id,
        parent_id,
        hierarchylevel,
        shallowreference,
        deepreference,
        absolutereference,
        ...data
      }) => ({
        ID: id,
        parent_ID: parent_id,
        hierarchyLevel: hierarchylevel,
        deepReference: deepreference,
        shallowReference: shallowreference,
        absoluteReference: absolutereference,
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
        tenant: req.user.tenant,
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
      if (item.type === "Manual")
        throw Error("Reset is not allowed for entries of type 'Manual'");

      // eslint-disable-next-line no-unused-vars
      const { customer_friendlyID, project_friendlyID, ...reducedItem } = item;

      await tx.run(DELETE.from(WorkItems).where({ ID: item.ID }));

      return reducedItem;
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
            tenant: req.user.tenant,
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
    item.tenant = req.user.tenant;

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
        // eslint-disable-next-line no-unused-vars
        SELECT: { where = "ID != null", columns, orderBy, limit },
      },
    } = req;

    // const myCategoriesWithTagsQuery = `SELECT sub.ID, sub.title, sub.parent_ID, sub.path, STRING_AGG(tag_title, ' ') as tags FROM (${myCategoriesQuery}) sub
    //   left outer join iot_planner_Tags2Categories as t2c on sub.ID = t2c.category_ID
    //   group by sub.ID, sub.title, sub.parent_ID, sub.path;`;

    const [devOpsWorkItems, MSGraphEvents, localWorkItems, myCategories] =
      await Promise.all([
        // AzDevOpsSrv.tx(req)
        //   .read("WorkItems", columns)
        //   .where(where)
        //   .orderBy(orderBy)
        //   .limit(limit),
        [],
        // [],
        // TODO: Breaks if no start- and enddatetime are provided: Fix it!
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
      })
    );

    // Reihenfolge ist wichtig (bei gleicher ID wird erstes mit letzterem überschrieben)
    // TODO: Durch explizite Sortierung absichern.
    const combined = [
      // ...devOpsWorkItems.map((itm) => ({ ...itm, confirmed: false })),
      ...MSGraphWorkItems.map((itm) => ({ ...itm, confirmed: false })),
      ...localWorkItems.map((itm) => ({ ...itm, confirmed: true })),
    ]
      // .reduce((acc, item) => acc.concat(item), [])
      /*
        Nur Items mit ID und AssignedTo übernehmen
        => Verhindert, dass lokale Ergänzungen geladen werden, die in MSGraph oder DevOps gelöscht wurden
        */
      .filter((itm) => itm)
      .filter(({ ID, completedDate }) => !!ID && !!completedDate);

    const map = {};

    // eslint-disable-next-line no-restricted-syntax
    for (const appointment of combined) {
      // Der Parent-Path kann nicht per join oder Assoziation ermittelt werden, da es sich bei der Selektion der Kategorien und der entsprechenden Pfade um eine custom-implementation handelt. Lösung: Alle myCategories laden und manuell zuordnen
      let parent = {};

      if (appointment.parent_ID) {
        // the view for "myCategories" is deployed directly via SQL (not generated by CDS). Somehow the query is in lowercase => use "id" instead of "ID"
        parent = myCategories.find(({ id }) => id === appointment.parent_ID);
      } else {
        // const tags = appointment.tags.map(({ tag_title }) => tag_title);

        const titleSubstrings = appointment.title.split(" ");

        const categoriesByReference = myCategories.filter(
          ({ shallowReference, deepReference, absoluteReference }) =>
            (absoluteReference &&
              titleSubstrings.some((sub) => sub === absoluteReference)) ||
            (deepReference &&
              titleSubstrings.some((sub) => sub === deepReference)) ||
            (shallowReference &&
              titleSubstrings.some((sub) => sub === shallowReference))
        );

        if (categoriesByReference.length > 0) {
          [parent] = categoriesByReference;
        } else {
          const bestMatch = levenary.default(
            appointment.title,
            myCategories.map((cat) => cat.path.replaceAll(" > ", " "))
          );

          if (bestMatch) {
            parent = myCategories.find(
              (cat) => cat.path.replaceAll(" > ", " ") === bestMatch
            );
          } else parent = {};
        }
      }

      map[appointment.ID] = { ...appointment, parentPath: parent?.path };
    }
    const results = Object.values(map).filter(({ deleted }) => !deleted);

    results.$count = results.length;
    return results;
  });
});
