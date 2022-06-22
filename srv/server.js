"use strict";

const cds = require("@sap/cds");
const proxy = require("@sap/cds-odata-v2-adapter-proxy");
const msalAuth = require("cds-msal-auth/auth");

cds.on("bootstrap", (app) => {
  app.use(proxy());

  msalAuth(app);
});

module.exports = cds.server;
