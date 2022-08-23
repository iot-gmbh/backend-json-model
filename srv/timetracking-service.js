const uuid = require("uuid");
const cds = require("@sap/cds");
const levenary = require("levenary");

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
  const { Users, WorkItems } = db.entities("iot.planner");
  const { MyWorkItems } = this.entities();

  this.on("removeDraft", async (req) => {
    const {
      data: { ID, activatedDate, completedDate },
      user,
    } = req;

    await db.run(
      INSERT.into(MyWorkItems).entries({
        ID,
        tenant: user.tenant,
        deleted: true,
        assignedTo_userPrincipalName: user.id,
        activatedDate,
        completedDate,
      })
    );
  });

  this.on("resetToDraft", async (req) => {
    const {
      data: { ID },
    } = req;

    const [item] = await db.read(MyWorkItems).where({ ID });

    if (!item) throw Error("Item not found");
    if (item.source === "Manual")
      throw Error("Reset is only for items from 3rd party sources.");

    const [result] = await Promise.all([
      MSGraphSrv.send("getWorkItemByID", { ID }),
      db.run(DELETE.from(MyWorkItems).where({ ID })),
    ]);

    return [result];
  });

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
    // use db.read to select persisted workitems only
    const entries = await db.read(MyWorkItems).where({ ID: item.ID });

    // Check whether it is a workitem that is persisted or whether it is a draft from a 3rd party source (MSGraph, ...)
    if (entries.length === 0) throw Error("You can not delete a draft entity");

    await db.run(DELETE.from(MyWorkItems).where({ ID: item.ID }));
  });

  this.on("UPDATE", "MyWorkItems", async (req) => {
    const item = req.data;
    const tx = this.transaction(req);

    item.confirmed = true;
    item.tenant = req.user.tenant;
    item.assignedTo_userPrincipalName = req.user.id;
    item.duration = calcDurationInH({
      start: item.activatedDate,
      end: item.completedDate,
    });

    const dates = calcDates(item);
    Object.assign(item, dates);

    delete item.tags;

    const [entry] = await db.read(WorkItems).where({ ID: item.ID });

    if (entry) {
      return tx.run(UPDATE(WorkItems, item.ID).with(item));
    }

    return tx.run(INSERT.into(WorkItems).entries(item));
  });

  this.on("CREATE", "MyWorkItems", async (req, next) => {
    // Create a V4 UUID (=> https://github.com/uuidjs/uuid#uuidv5name-namespace-buffer-offset)
    req.data.ID = uuid.v4();
    req.data.source = "Manual";
    req.data.confirmed = true;
    req.data.duration = calcDurationInH({
      start: req.data.activatedDate,
      end: req.data.completedDate,
    });
    req.data.assignedTo_userPrincipalName = req.user.id;
    req.data.tenant = req.user.tenant;

    const dates = calcDates(req.data);
    Object.assign(req.data, dates);

    return next();
  });

  this.on("READ", "MSGraphWorkItems", async (req) => MSGraphSrv.run(req.query));

  this.on("getWorkItemByID", async (req) => {
    const {
      data: { ID },
    } = req;
    const [MSGraphEvent, localWorkItem] = await Promise.all([
      MSGraphSrv.send("getWorkItemByID", { ID }),
      cds.run(SELECT.from(MyWorkItems).where(ID)),
    ]);

    const workItem = {...MSGraphEvent, localWorkItem};

    const parent = this.run
  });

  this.on("getCalendarView", async (req) => {
    const {
      data: { startDateTime, endDateTime },
    } = req;

    const [MSGraphEvents, localWorkItems, myCategories] = await Promise.all([
      MSGraphSrv.send("getCalendarView", req.data),
      cds.run(
        SELECT.from(MyWorkItems).where(
          `activatedDate >= '${startDateTime}' and completedDate <= '${endDateTime}'`
        )
      ),
      this.run(SELECT.from("MyCategories")),
    ]);

    // Reihenfolge ist wichtig (bei gleicher ID wird erstes mit letzterem überschrieben)
    // TODO: Durch explizite Sortierung absichern.
    const combined = [
      // ...devOpsWorkItems.map((itm) => ({ ...itm, confirmed: false })),
      ...MSGraphEvents.map((itm) => ({ ...itm, confirmed: false })),
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
        parent = myCategories.find(({ ID }) => ID === appointment.parent_ID);
      } else if (appointment.title) {
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
      } else parent = {};

      map[appointment.ID] = {
        ...appointment,
        parentPath: parent?.path,
        parent,
      };
    }

    const results = Object.values(map).filter(({ deleted }) => !deleted);

    results.$count = results.length;
    return results;
  });
});
