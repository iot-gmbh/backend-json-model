require("dotenv").config();
const uuid = require("uuid");
const cds = require("@sap/cds");

function transformCQN(CQN) {
  //typeof null is also object. But we cannot destructure it. So check that object is not null
  const isValidObject = (obj) => typeof obj === "object" && obj !== null;

  function changeValue(objFromProp) {
    let obj = objFromProp;

    if (isValidObject(objFromProp)) {
      //desctructure the object to create new reference
      obj = { ...objFromProp };
      // iterating over the object using for..in
      for (var key in obj) {
        //checking if the current value is an object itself
        if (isValidObject(obj[key])) {
          // if so then again calling the same function
          obj[key] = changeValue(obj[key]);
        } else {
          // else getting the value and replacing single { with {{ and so on
          let keyValue = transformWIToMSGraphEvent(obj[key]);
          obj[key] = keyValue;
        }
      }
    }
    return obj;
  }

  return changeValue(CQN);
}

function transformWIToMSGraphEvent(prop) {
  // return mapWIToMSGraphEvent[prop] || prop;
  return mapWIToMSGraphEvent[prop] || prop;
}

const mapWIToMSGraphEvent = {
  ID: "id",
  subject: "title",
  activatedDate: "start/dateTime",
  completedDate: "end/dateTime",
  private: "sensitivity",
};

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

module.exports = cds.service.impl(async function () {
  const db = await cds.connect.to("db");
  const AzDevOpsSrv = await cds.connect.to("AzureDevopsService");
  const MSGraphSrv = await cds.connect.to("MSGraphService");

  const { WorkItems } = db.entities("iot.planner");

  this.on("UPDATE", "MyWorkItems", async (req) => {
    const item = req.data;
    const entries = await this.read(WorkItems).where({ ID: item.ID });

    const durationInMS =
      new Date(item.completedDate) - new Date(item.activatedDate);
    const durationInH = durationInMS / 1000 / 60 / 60;

    item.duration = durationInH;

    if (entries.length === 0) db.run(INSERT.into(WorkItems).entries(item));
    else UPDATE(WorkItems, item).with(item);
  });

  this.on("CREATE", "MyWorkItems", async (req, next) => {
    // Create a V4 UUID (=> https://github.com/uuidjs/uuid#uuidv5name-namespace-buffer-offset)

    const durationInMS =
      new Date(req.data.completedDate) - new Date(req.data.activatedDate);
    const durationInH = durationInMS / 1000 / 60 / 60;

    const user = process.env.NODE_ENV
      ? req.user.id
      : "benedikt.hoelker@iot-online.de";

    req.data.ID = uuid.v4();
    req.data.type = "Manual";
    req.data.duration = durationInH;
    req.data.assignedTo_userPrincipalName = user;

    return next();
  });

  this.on("READ", "MyWorkItems", async (req) => {
    const {
      query: {
        SELECT: { where, columns, orderBy, limit },
      },
    } = req;

    // const MSGraphQ = transformCQN(req.query.SELECT);

    // Reihenfolge ist wichtig (bei gleicher ID wird erstes mit letzterem überschrieben)
    // TODO: Durch explizite Sortierung absichern.
    const [devOpsWorkItems, localWorkItems, MSGraphEvents] = await Promise.all([
      AzDevOpsSrv.tx(req)
        .read("MyWorkItems", columns)
        .where(where)
        .orderBy(orderBy)
        .limit(limit),
      MSGraphSrv.tx(req)
        .read("Events", columns)
        .where(where)
        // .orderBy(MSGraphQ.orderBy)
        .limit(limit),
      db.tx(req).run(req.query),
    ]);

    const MSGraphWorkItems = MSGraphEvents.map((event) =>
      transformEventToWorkItem({ event, user: req.user })
    );

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
