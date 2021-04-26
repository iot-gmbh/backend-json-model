require("dotenv").config();
const uuid = require("uuid");
const cds = require("@sap/cds");
const moment = require("moment");

function transformEventToWorkItem({
  id,
  subject,
  start,
  end,
  categories: [customer_friendlyID],
  sensitivity,
  user,
}) {
  return {
    ID: id,
    title: subject,
    customer_friendlyID,
    activatedDate: start.dateTime.substring(0, 19) + "Z",
    completedDate: end.dateTime.substring(0, 19) + "Z",
    assignedTo_userPrincipalName: user,
    private: sensitivity === "private",
    type: "Event",
  };
}

function calcDurationInH({ start, end }) {
  const durationInMS = new Date(end) - new Date(start);
  const durationInH = durationInMS / 1000 / 60 / 60;
  return durationInH;
}

module.exports = cds.service.impl(async function () {
  const db = await cds.connect.to("db");
  const AzDevOpsSrv = await cds.connect.to("AzureDevopsService");
  const MSGraphSrv = await cds.connect.to("MSGraphService");

  const { WorkItems, Customers, Projects } = db.entities("iot.planner");

  this.on("DELETE", "MyWorkItems", async (req) => {
    const item = req.data;
    const tx = this.transaction(req);
    const entries = await this.read(WorkItems).where({ ID: item.ID });

    if (entries.length > 0)
      await tx.run(DELETE.from(WorkItems).where({ ID: item.ID }));

    await tx.run(
      INSERT.into(WorkItems).entries({
        ID: item.ID,
        deleted: true,
        assignedTo_userPrincipalName: "DELETED",
        customer_friendlyID: "DELETED",
        project_friendlyID: "DELETED",
      })
    );
  });

  this.on("UPDATE", "MyWorkItems", async (req) => {
    const item = req.data;
    const tx = this.transaction(req);

    if (item.resetEntry) {
      // RESET
      // eslint-disable-next-line no-unused-vars
      const { customer_friendlyID, project_friendlyID, ...reducedItem } = item;

      await tx.run(DELETE.from(WorkItems).where({ ID: item.ID }));
      return item.type === "Manual" ? { ID: item.ID } : reducedItem;
    }

    const entries = await this.read(WorkItems).where({ ID: item.ID });

    if (item.deleted) {
      // DELETE
      if (entries.length > 0)
        return await tx.run(DELETE.from(WorkItems).where({ ID: item.ID }));

      return await tx.run(
        INSERT.into(WorkItems).entries({
          ID: item.ID,
          activatedDate: item.activatedDate,
          completedDate: item.completedDate,
          deleted: true,
          assignedTo_userPrincipalName: "DELETED",
          customer_friendlyID: "DELETED",
          project_friendlyID: "DELETED",
        })
      );
    } else {
      // UPDATE
      item.duration = calcDurationInH({
        start: item.activatedDate,
        end: item.completedDate,
      });

      let itm = item;

      if (entries.length === 0) {
        itm = await tx.run(INSERT.into(WorkItems).entries(item));
      } else {
        itm = await tx.run(UPDATE(WorkItems, item.ID).with(item));
      }

      return itm;
    }
  });

  this.on("CREATE", "MyWorkItems", async (req, next) => {
    // Create a V4 UUID (=> https://github.com/uuidjs/uuid#uuidv5name-namespace-buffer-offset)

    const user = process.env.NODE_ENV
      ? req.user.id
      : "benedikt.hoelker@iot-online.de";

    req.data.ID = uuid.v4();
    req.data.type = "Manual";
    req.data.duration = calcDurationInH({
      start: req.data.activatedDate,
      end: req.data.completedDate,
    });
    req.data.assignedTo_userPrincipalName = user;

    return next();
  });

  this.on("READ", "MyWorkItems", async (req) => {
    const {
      query: {
        SELECT: { where = "ID != null", columns, orderBy, limit },
      },
    } = req;

    const [devOpsWorkItems, localWorkItems, MSGraphEvents] = await Promise.all([
      AzDevOpsSrv.tx(req)
        .read("MyWorkItems", columns)
        .where(where)
        .orderBy(orderBy)
        .limit(limit),
      db.tx(req).run(req.query),
      MSGraphSrv.tx(req)
        .read("Events", columns)
        .where(where)
        .orderBy(orderBy)
        .limit(limit),
    ]);

    const MSGraphWorkItems = MSGraphEvents.map((event) =>
      transformEventToWorkItem({ ...event, user: req.user.id })
    );

    // Reihenfolge ist wichtig (bei gleicher ID wird erstes mit letzterem überschrieben)
    // TODO: Durch explizite Sortierung absichern.
    const map = [...devOpsWorkItems, MSGraphWorkItems, localWorkItems]
      .reduce((acc, item) => acc.concat(item), [])
      /*
        Nur Items mit ID und AssignedTo übernehmen
        => Verhindert, dass lokale Ergänzungen geladen werden, die in MSGraph oder DevOps gelöscht wurden
        */
      .filter((itm) => itm)
      .filter(({ ID, completedDate }) => !!ID && !!completedDate)
      .reduce((map, curr) => {
        map[curr.ID] = {
          ...map[curr.ID],
          ...curr,
        };
        return map;
      }, {});

    let results = Object.values(map).filter(({ deleted }) => !deleted);

    const srv = this;

    // TODO: Schleifen-basierte SQL-Abfragen ersetzen
    async function addExtraInfosTo(workItems) {
      for (const item of workItems.filter(({ title }) => !!title)) {
        const titleSubstrings = item.title.split(" ");

        if (!item.customer_friendlyID) {
          const query = titleSubstrings
            .map((sub) => `friendlyID like '%${sub}%' or name like '%${sub}'`)
            .join(" OR ");

          const [customer] = await srv.read(Customers).where(query);

          if (item.private) {
            item.customer_friendlyID = "Privat";
          }

          if (customer) {
            item.customer_friendlyID = customer.friendlyID;
          }
        }

        if (!item.project_friendlyID) {
          const query = titleSubstrings
            .map((sub) => `friendlyID like '%${sub}%' or title like '%${sub}'`)
            .join(" OR ");

          const [project] = await srv.read(Projects).where(query);

          if (item.private) {
            item.project_friendlyID = "Privat";
          }

          if (project) {
            item.project_friendlyID = project.friendlyID;
          }
        }
      }
    }

    await addExtraInfosTo(results);

    results.$count = results.length;
    return results;
  });

  this.on("READ", "IOTWorkItems", async (req) => {
    let query = req.query;
    const selectDatumBis = query.SELECT.columns.find((column) => {
      if (!column || !column.ref) return false;
      return column.ref[0] === "DatumBis";
    });

    if (!selectDatumBis) {
      // Hidden in UI, thus add it manually
      query.SELECT.columns.push({ ref: ["DatumBis"] });
    }

    const items = await cds.tx(req).run(query);

    const IOTWorkItems = items.map((itm) => ({
      Datum: moment(itm.Datum).format("DD.MM.yyyy"),
      Beginn: moment(itm.Datum).format("HH:mm"),
      Ende: moment(itm.DatumBis).format("HH:mm"),
      P1: itm.P1,
      Projekt: itm.Projekt,
      Teilprojekt: itm.Teilprojekt,
      Arbeitspaket: itm.Arbeitspaket,
      Taetigkeit: itm.Taetigkeit,
      Einsatzort: itm.Einsatzort,
      P2: itm.P2,
      Bemerkung: itm.Bemerkung,
    }));

    return IOTWorkItems;
  });
});
