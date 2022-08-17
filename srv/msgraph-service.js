// const cdsapi = require("@sapmentors/cds-scp-api");
// const { ExpressionBuilder } = require("@sap/cds-runtime/lib/db/sql-builder");
const ExpressionBuilder = require("@sap/cds/libx/_runtime/db/sql-builder/ExpressionBuilder");

// MSGraph connection is inspired by: https://docs.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-nodejs-console
const auth = require("cds-msal-auth/auth/authConfig");
const fetch = require("cds-msal-auth/auth/fetch");

function parseQueryParams(select) {
  const { values } = new ExpressionBuilder(select.where).build();

  // sql:'( completedDate > ? OR activatedDate <= ? )'
  // values:
  // 0:'2021-05-02T22:00:00Z'
  // 1:'2021-05-09T22:00:00Z'

  const [
    startdatetime = "2022-08-14T22:00:00Z",
    enddatetime = "2022-08-19T22:00:00Z",
  ] = values;
  return { startdatetime, enddatetime };
}

module.exports = async function (srv) {
  srv.on("READ", "Events", async (req) => {
    // const query = parseQueryParams(req.query.SELECT);
    // const queryString = Object.entries(query)
    //   .map(([key, value]) => `${key}=${value}`)
    //   .join("&");
    /* 
    REVISIT 
    req.query.where contains additional restrictions due to authorizations which are not part of "req.getQueryOptions.query"
    => in this case no problem, as we are accessing the "GRAPH_ME_ENDPOINT" only
    */
    const queryString = req.getUrlObject().query;
    const queryStringRepl = queryString
      .replaceAll("ID", "id")
      .replaceAll("title", "subject")
      .replaceAll("completedDate", "end")
      .replaceAll("activatedDate", "start")
      .replaceAll("&%24expand=tags", "");

    const selectFields = [
      "id",
      "subject",
      "start",
      "end",
      "categories",
      "sensitivity",
      "isAllDay",
    ];

    const { value } = await fetch(
      `${
        auth.GRAPH_ME_ENDPOINT
      }/calendarview?${queryStringRepl}&$select=${selectFields.join(",")}`,
      req.user.accessToken
    );
    if (!value) return [];

    return value.map((val) => ({ ...val, id: encodeURIComponent(val.id) }));
  });

  srv.on("READ", "Users", async (req) => {
    const { value } = await fetch(auth.GRAPH_ME_ENDPOINT, req.user.accessToken);

    return value.map(({ id, ...usr }) => ({
      ID: id,
      ...usr,
    }));
  });
};
