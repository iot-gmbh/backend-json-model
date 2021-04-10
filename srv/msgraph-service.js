const cdsapi = require("@sapmentors/cds-scp-api");

module.exports = async function (srv) {
  const MSGraphSrv = await cdsapi.connect.to("MicrosoftGraphIOTGmbH");

  async function readEvents({ req, MSGraphSrv }) {
    const user = process.env.NODE_ENV
      ? req.user.id
      : "benedikt.hoelker@iot-online.de";

    let events = [];
    let queryString = "";

    if (req.data.ID) queryString = `/${req.data.ID}`;
    else {
      queryString = Object.entries(req._query)
        .filter(([key]) => !key.includes("$select"))
        .reduce(
          (str, [key, value]) => str.concat("&", key, "=", value),
          "?$select=id,subject,start,end,categories,sensitivity"
        )
        // TODO: Replace with a better transformation
        .replace("completedDate", "end/dateTime")
        .replace("activatedDate", "start/dateTime")
        .replace(/\+01:00/g, "Z")
        // Leading Apostrophe
        .replace(/202/g, "'202")
        // Closing Apostrophe
        .replace(/Z/g, "Z'");
    }

    const { value } = await MSGraphSrv.run({
      url: `/v1.0/users/${user}/events${queryString}`,
    });

    events = value.map(
      // Die Kategorie wird als Kunde ausgelesen
      ({
        id,
        subject,
        start,
        end,
        categories: [customer_friendlyID],
        sensitivity,
      }) => ({
        ID: id,
        title: subject,
        customer_friendlyID,
        activatedDate: start.dateTime.substring(0, 19) + "Z",
        completedDate: end.dateTime.substring(0, 19) + "Z",
        assignedTo_userPrincipalName: user,
        private: sensitivity === "private",
        type: "Event",
      })
    );

    return events;
  }

  srv.on("READ", "Events", async (req) => {
    const events = await readEvents({ req, MSGraphSrv });
    return events;
  });

  srv.on("READ", "Users", async () => {
    let users = [];
    const { value } = await MSGraphSrv.run({
      url: `/v1.0/users`,
    });

    users = value.map(({ id, ...usr }) => ({
      ID: id,
      ...usr,
    }));

    return users;
  });
};
