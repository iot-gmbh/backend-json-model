module.exports = async function (srv) {
  const msGraphSrv = await cds.connect.to("microsoft.graph");

  srv.on("READ", "Events", async (req) => {
    req.query.SELECT.orderBy = [{ ref: ["start/dateTime"], sort: "asc" }];

    const events = await msGraphSrv.send({
      query: req.query,
      headers: {
        Authorization: `Bearer ${req.user.accessToken}`,
      },
    });

    return events;
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
