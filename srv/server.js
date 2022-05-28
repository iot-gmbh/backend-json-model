"use strict";

const cds = require("@sap/cds");
const express = require("express");
const proxy = require("@sap/cds-odata-v2-adapter-proxy");
const { auth, requiresAuth } = require("express-openid-connect");

require("dotenv").config();
const auth0Audience = process.env.AUTH0_AUDIENCE;

const config = {
  authRequired: false, // deactivate auth for all routes
  auth0Logout: true, // logout from IdP
  authorizationParams: {
    // required to retrieve JWT including permissions (our roles)
    response_type: "code",
    scope: "openid",
    audience: auth0Audience,
  },
};

cds.on("bootstrap", (app) => {
  // initialize openid-connect with auth0 configuration
  app.use(auth(config));
  app.use(proxy());

  // Example of a protected route
  // TODO: Protect app
  // cf. https://blogs.sap.com/2021/08/06/sap-cap-with-social-login-and-rbac-using-auth0/
  app.use("/app", requiresAuth(), express.static(__dirname + "/../app"));
});

module.exports = cds.server;
