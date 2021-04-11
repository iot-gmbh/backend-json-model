const cdsapi = require("@sapmentors/cds-scp-api");
const { ExpressionBuilder } = require("@sap/cds-runtime/lib/db/sql-builder");

function parseQueryParams(select) {
  const { values } = new ExpressionBuilder(select.where).build();

  // sql:'( completedDate > ? OR activatedDate <= ? )'
  // values:
  // 0:'2021-05-02T22:00:00Z'
  // 1:'2021-05-09T22:00:00Z'

  const [startdatetime, enddatetime] = values;
  return { startdatetime, enddatetime };
}

module.exports = async function (srv) {
  const MSGraphSrv = await cdsapi.connect.to("MicrosoftGraphIOTGmbH");

  srv.on("READ", "Events", async (req) => {
    const user = process.env.NODE_ENV
      ? req.user.id
      : "benedikt.hoelker@iot-online.de";

    const query = parseQueryParams(req.query.SELECT);
    const queryString = Object.entries(query)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    const { value } = await MSGraphSrv.run({
      url: `/v1.0/users/${user}/calendarview?${queryString}`,
    });

    return value;
  });

  srv.on("READ", "Users", async () => {
    const { value } = await MSGraphSrv.run({
      url: `/v1.0/users`,
    });

    return value.map(({ id, ...usr }) => ({
      ID: id,
      ...usr,
    }));
  });
};
