const cds = require("@sap/cds");
const cdsapi = require("@sapmentors/cds-scp-api");

module.exports = cds.service.impl(async function () {
  const { Users } = this.entities;
  const service = await cdsapi.connect.to("MicrosoftGraphBHOPersonalAD");

  this.on("READ", Users, async (request) => {
    try {
      const user = await service.run({
        url: `/v1.0/users`,
      });
      return user.value.map(({ id, businessPhones, ...usr }) => ({
        ID: id,
        ...usr,
      }));
    } catch (error) {
      throw new Error(
        "An error occured during the request to MS-Graph: " + error.message
      );
    }
  });
});
