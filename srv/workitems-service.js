require("dotenv").config();
const uuid = require("uuid");
const cds = require("@sap/cds");

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

  const { WorkItems } = db.entities("iot.planner");

  this.on("UPDATE", "MyWorkItems", async (req) => {
    const item = req.data;
    const tx = this.transaction(req);

    if (item.deleteEntry) {
      // eslint-disable-next-line no-unused-vars
      const { customer_friendlyID, project_friendlyID, ...reducedItem } = item;

      await tx.run(DELETE.from(WorkItems).where({ ID: item.ID }));
      return item.type === "Manual" ? { ID: item.ID } : reducedItem;
    }

    const entries = await this.read(WorkItems).where({ ID: item.ID });

    item.duration = calcDurationInH({
      start: item.activatedDate,
      end: item.completedDate,
    });

    if (!item.project_friendlyID) throw new Error("No project selected.");

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

    if (!req.data.project_friendlyID) throw new Error("No project selected.");

    return next();
  });

  this.on("READ", "MyWorkItems", async (req) => {
    const {
      query: {
        SELECT: { where, columns, orderBy, limit },
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

    let results = Object.values(map);

    results.$count = results.length;
    return results;
  });

  this.on("READ", "WorkItems", async (req) => {
    // share request context with the external service
    // inside a custom handler
    const tx = AzDevOpsSrv.transaction(req);
    const response = await tx.run(req.query);

    return response;
  });
});
