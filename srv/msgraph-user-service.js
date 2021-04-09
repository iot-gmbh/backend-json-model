const cds = require("@sap/cds");
const cdsapi = require("@sapmentors/cds-scp-api");

module.exports = cds.service.impl(async function () {
  this.on("READ", "Events", async (req) => {
    const service = await cdsapi.connect.to("MicrosoftGraphIOTGmbH");
    const user = process.env.NODE_ENV
      ? req.user.id
      : "benedikt.hoelker@iot-online.de";

    let events = [];
    try {
      const { value } = await service.run({
        url: `/v1.0/users/${user}/events`,
      });

      events = value.map(
        ({ id, subject, start, end, categories: [customer], sensitivity }) => ({
          ID: id,
          title: subject,
          customer,
          activatedDate: start.dateTime.substring(0, 19) + "Z",
          completedDate: end.dateTime.substring(0, 19) + "Z",
          assignedTo: user,
          private: sensitivity === "private",
        })
      );
    } catch (error) {
      console.log(error);
    }

    // return values;
    return events;
  });

  this.on("READ", "Users", async () => {
    const service = await cdsapi.connect.to("MicrosoftGraphIOTGmbH");

    let users = [];
    try {
      const { value } = await service.run({
        url: `/v1.0/users`,
      });

      users = value.map(({ id, ...usr }) => ({
        ID: id,
        ...usr,
      }));
    } catch (error) {
      console.log(error);
    }

    // return values;
    return users;
  });
});
