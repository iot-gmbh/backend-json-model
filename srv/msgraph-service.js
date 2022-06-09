// const cdsapi = require("@sapmentors/cds-scp-api");
// const { ExpressionBuilder } = require("@sap/cds-runtime/lib/db/sql-builder");
const ExpressionBuilder = require("@sap/cds/libx/_runtime/db/sql-builder/ExpressionBuilder");

// MSGraph connection is inspired by: https://docs.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-nodejs-console
// const auth = require("./msgraph/auth");
// const fetch = require("./msgraph/fetch");
const auth = {};
const fetch = {};

function parseQueryParams(select) {
  const { values } = new ExpressionBuilder(select.where).build();

  // sql:'( completedDate > ? OR activatedDate <= ? )'
  // values:
  // 0:'2021-05-02T22:00:00Z'
  // 1:'2021-05-09T22:00:00Z'

  const [
    startdatetime = new Date().toISOString(),
    enddatetime = new Date().toISOString(),
  ] = values;
  return { startdatetime, enddatetime };
}

module.exports = async function (srv) {
  srv.on("READ", "Events", async (req) => {
    const user = process.env.NODE_ENV
      ? req.user.id
      : "daniel.mextorf@iot-online.de";

    // here we get an access token
    const authResponse = await auth.getToken(auth.tokenRequest);

    const query = parseQueryParams(req.query.SELECT);
    const queryString = Object.entries(query)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    const selectFields = [
      "id",
      "subject",
      "start",
      "end",
      "categories",
      "sensitivity",
    ];

    var { value } = await fetch.callApi(
      `${
        auth.apiConfig.uri
      }/${user}/calendarview?${queryString}&$top=1000&$select=${selectFields.join(
        ","
      )}`,
      authResponse.accessToken
    );

    return value.map((val) => ({ ...val, id: encodeURIComponent(val.id) }));
  });

  srv.on("READ", "Users", async () => {
    // here we get an access token
    const authResponse = await auth.getToken(auth.tokenRequest);

    const { value } = await fetch.callApi(
      auth.apiConfig.uri,
      authResponse.accessToken
    );

    return value.map(({ id, ...usr }) => ({
      ID: id,
      ...usr,
    }));
  });
};
