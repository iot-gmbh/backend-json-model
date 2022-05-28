// See this blogpost by Kai Niklas: https://blogs.sap.com/2021/08/06/sap-cap-with-social-login-and-rbac-using-auth0/

const cds = require("@sap/cds");
const { requiresAuth } = require("express-openid-connect");
const jsonwebtoken = require("jsonwebtoken");

// To debug this module set export DEBUG=cds-auth0
const DEBUG = cds.debug("cds-auth0");

// CAP user
const Auth0User = class extends cds.User {
  is(role) {
    DEBUG && DEBUG("Requested role: " + role);
    return role === "any" || this._roles[role];
  }
};

// the authentication function for CAP
function capAuth0(req, res, next) {
  if (!req.oidc.user) {
    DEBUG && DEBUG("No user");
    return next(Error());
  }

  // map token attributes to CAP user
  let capUser = {
    id: req.oidc.user.sub,
    _roles: ["authenticated-user"],
  };

  // retrieve permissions
  let jwtDecoded = jsonwebtoken.decode(req.oidc.accessToken.access_token);

  if (jwtDecoded.permissions) {
    capUser._roles.push(...jwtDecoded.permissions);
  }

  req.user = new Auth0User(capUser);

  DEBUG && DEBUG("capUser");
  DEBUG && DEBUG(capUser);

  next();
}

module.exports = [requiresAuth(), capAuth0];
