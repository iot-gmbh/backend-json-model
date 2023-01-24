const cds = require("@sap/cds");
const proxy = require("@sap/cds-odata-v2-adapter-proxy");
const msalAuth = require("cds-msal-auth/auth");

require("dotenv").config();

cds.on("bootstrap", async (app) => {
  app.use(proxy());
  app.use(msalAuth());
});

module.exports = cds.server;
