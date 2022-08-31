const cds = require("@sap/cds");
const proxy = require("@sap/cds-odata-v2-adapter-proxy");
const msalAuth = require("cds-msal-auth/auth");

require("dotenv").config();

cds.on("bootstrap", (app) => {
  msalAuth(app);
  app.use(proxy());

  app.use((req, _, next) => {
    if (req.method === "POST" && req.data) {
      const tenant = req.session.account.tenantId;
      req.data.tenant = tenant;
    }
    next();
  });
});

module.exports = cds.server;
