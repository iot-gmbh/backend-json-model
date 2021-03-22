const cds = require("@sap/cds");
const cdsapi = require("@sapmentors/cds-scp-api");

module.exports = cds.service.impl(async function () {
  const { Users } = this.entities;

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
