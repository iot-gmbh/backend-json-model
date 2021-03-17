const cds = require("@sap/cds");
const cdsapi = require("@sapmentors/cds-scp-api");

module.exports = cds.service.impl(async function () {
  const { Users } = this.entities;

  this.on("READ", "Users", async (request) => {
    const service = await cdsapi.connect.to("MicrosoftGraphBHOPersonalAD");

    let values = [];
    try {
      values = await service.run({
        url: `/v1.0/users/f4203119-a2ad-4411-96d6-72c8df8545ff/events`,
      });
    } catch (error) {
      console.log(error);
    }

    return values;
    // return user.value.map(({ id, businessPhones, ...usr }) => ({
    //   ID: id,
    //   ...usr,
    // }));
  });
});
