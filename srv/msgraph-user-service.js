const cds = require("@sap/cds");
const cdsapi = require("@sapmentors/cds-scp-api");

module.exports = cds.service.impl(async function () {
  const { Users } = this.entities;

  this.on("READ", "Users", async (request) => {
    const service = await cdsapi.connect.to("MicrosoftGraphBHOPersonalAD");
    const user = await service.run({
      url: `/v1.0/users`,
    });
    return user.value.map(({ id, businessPhones, ...usr }) => ({
      ID: id,
      ...usr,
    }));
  });
});
