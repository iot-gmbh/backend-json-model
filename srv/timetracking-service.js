const uuid = require("uuid");
const cds = require("@sap/cds");

require("dotenv").config();

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
  const MSGraphSrv = await cds.connect.to("MSGraphService");
  const AzDevOpsSrv = await cds.connect.to("AzureDevopsService");

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
      if (item.type !== "Manual")
        throw Error("Reset is not allowed for entries of type 'Manual'");

      // eslint-disable-next-line no-unused-vars
      const { customer_friendlyID, project_friendlyID, ...reducedItem } = item;

      await tx.run(DELETE.from(WorkItems).where({ ID: item.ID }));

      return item.type === "Manual" ? { ID: item.ID } : reducedItem;
    }

    const entries = await this.read(WorkItems).where({ ID: item.ID });

    if (item.deleted) {
      // DELETE
      if (entries.length > 0) {
        await tx.run(DELETE.from(WorkItems).where({ ID: item.ID }));
      } else {
        await tx.run(
          INSERT.into(WorkItems).entries({
            ID: item.ID,
            activatedDate: item.activatedDate,
            completedDate: item.completedDate,
            deleted: true,
            assignedTo_userPrincipalName: req.user.id,
            customer_friendlyID: "DELETED",
            project_friendlyID: "DELETED",
          })
        );
      }

      return item;
    } else {
      // UPDATE
      item.duration = calcDurationInH({
        start: item.activatedDate,
        end: item.completedDate,
      });
      item.confirmed = true;

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

    req.data.ID = uuid.v4();
    req.data.type = "Manual";
    req.data.confirmed = true;
    req.data.duration = calcDurationInH({
      start: req.data.activatedDate,
      end: req.data.completedDate,
    });
    req.data.assignedTo_userPrincipalName = req.user.id;

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
        .read("WorkItems", columns)
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

        if (item.private) {
          // TODO: Dynamischer Schlüssel für privates Projekt
          item.customer_friendlyID = "Privat";
        }

        if (!item.customer_friendlyID) {
          const query = titleSubstrings
            .map((sub) => `friendlyID like '%${sub}%' or name like '%${sub}'`)
            .join(" OR ");

          const [customer] = await srv.read(Customers).where(query);

          if (customer) {
            item.customer_friendlyID = customer.friendlyID;
          }
        }

        if (!item.project_friendlyID) {
          const query = titleSubstrings
            .map((sub) => `friendlyID like '%${sub}%' or title like '%${sub}'`)
            .join(" OR ");

          const [project] = await srv.read(Projects).where(query);

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
});
