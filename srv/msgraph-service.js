module.exports = async function (srv) {
  const msGraphSrv = await cds.connect.to("microsoft.graph");

  const transform = (entity) => {
    const data = entity;
    delete data["calendar@odata.associationLink"];
    delete data["calendar@odata.navigationLink"];
    data.start = data.start.dateTime;
    data.end = data.end.dateTime;
    return data;
  };

  srv.on("READ", "Events", async (req) => {
    req.query.SELECT.orderBy = [{ ref: ["subject"], sort: "asc" }];
    req.query.SELECT.where = [
      { ref: ["start", "dateTime"] },
      "<=",
      { val: "2022-08-18T07:40:56.316Z" },
    ];

    const events = await msGraphSrv.send({
      query: req.query,
      headers: {
        Authorization: `Bearer ${req.user.accessToken}`,
      },
    });

    if (Array.isArray(events)) {
      return events.map((event) => transform(event));
    }
    return transform(events);
  });

  srv.on("READ", "Users", async (req) => {
    const myUser = await msGraphSrv.send({
      query: "GET /",
      headers: {
        Authorization: `Bearer ${req.user.accessToken}`,
      },
    });

    return myUser;
  });
};
