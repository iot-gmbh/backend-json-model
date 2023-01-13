const cds = require("@sap/cds");
const proxy = require("@sap/cds-odata-v2-adapter-proxy");
const msalAuth = require("cds-msal-auth/auth");

require("dotenv").config();

cds.on("bootstrap", (app) => {
  msalAuth(app);
  app.use(proxy());
});

module.exports = cds.server;

if (process.env.NODE_ENV !== "production") {
  const cds_swagger = require("cds-swagger-ui-express");
  cds.on("bootstrap", (app) => app.use(cds_swagger()));
}

module.exports = cds.server;
