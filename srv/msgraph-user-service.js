const cds = require("@sap/cds");
const cdsapi = require("@sapmentors/cds-scp-api");

module.exports = cds.service.impl(async function () {
  const { Users } = this.entities;

  this.on("READ", "Events", async (req) => {
    const service = await cdsapi.connect.to("MicrosoftGraphIOTGmbH");

    let events = [];
    try {
      const { value } = await service.run({
        url: `/v1.0/users/benedikt.hoelker@iot-online.de/events`,
        // url: `/v1.0/users/${req.user.id}/events`,
      });

      events = value.map(
        ({ id, subject, start, end, categories: [customer], sensitivity }) => ({
          ID: id,
          subject,
          customer,
          start: start.dateTime.substring(0, 19) + "Z",
          end: end.dateTime.substring(0, 19) + "Z",
          private: sensitivity === "private",
        })
      );
    } catch (error) {
      console.log(error);
    }

    // return values;
    return events;
  });

  this.on("READ", "Users", async (request) => {
    const service = await cdsapi.connect.to("MicrosoftGraphIOTGmbH");

    let users = [];
    try {
      const { value } = await service.run({
        url: `/v1.0/users`,
      });

      users = value.map(({ id, businessPhones, ...usr }) => ({
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
