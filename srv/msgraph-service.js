module.exports = async function (srv) {
  const msGraphSrv = await cds.connect.to("microsoft.graph");

  const transform = (entity) => {
    const data = entity;
    delete data["calendar@odata.associationLink"];
    delete data["calendar@odata.navigationLink"];
    data.activatedDate = data.activatedDate.dateTime;
    data.completedDate = data.completedDate.dateTime;
    return data;
  };

  srv.on("READ", "Events", async (req) => {
    const query = JSON.parse(JSON.stringify(req.query));
    query.SELECT.orderBy = [{ ref: ["subject"], sort: "asc" }];

    query.SELECT.where = query.SELECT.where?.map((cond) => {
      if (cond && cond.ref && Array.isArray(cond.ref)) {
        if (cond.ref[0] === "activatedDate") {
          // eslint-disable-next-line no-param-reassign
          cond.ref = ["start", "dateTime"];
        } else if (cond.ref[0] === "completedDate") {
          // eslint-disable-next-line no-param-reassign
          cond.ref = ["end", "dateTime"];
        }
      }
      return cond;
    });

    delete query.SELECT.where;
    console.log(req.user.accessToken);
    const events = await msGraphSrv.send({
      query,
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
