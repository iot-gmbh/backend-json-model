/* eslint-disable no-unused-vars */
const passport = require("passport");
const cookieSession = require("cookie-session");

// Import dependencies
var crypto = require("crypto");
var adal = require("adal-node");

var {
  msalConfig,
  REDIRECT_URI,
  POST_LOGOUT_REDIRECT_URI,
} = require("../authConfig");

module.exports = async (app) => {
  //cookie-session converts the current session to an encrypted cookie using the
  //keys below
  app.use(
    cookieSession({
      name: "azure-ad-auth-session",
      keys: ["key1", "key2"],
    })
  );

  //initialise passport and set it up to use sessions
  app.use(passport.initialize());
  app.use(passport.session());

  // Authentication parameters
  var clientId = msalConfig.auth.clientId;
  var clientSecret = msalConfig.auth.clientSecret;
  var tenant = "common";
  var authorityUrl = "https://login.microsoftonline.com/" + tenant;
  var redirectUri = "http://localhost:4004";
  var resource = "https://graph.microsoft.com";

  // Configure logging
  adal.Logging.setLoggingOptions({
    log: function (level, message, error) {
      console.log(message);
    },
    level: adal.Logging.LOGGING_LEVEL.VERBOSE,
    loggingWithPII: false,
  });

  // Auth code request URL template
  var templateAuthzUrl =
    "https://login.microsoftonline.com/" +
    tenant +
    "/oauth2/authorize?response_type=code&client_id=" +
    clientId +
    "&redirect_uri=" +
    redirectUri +
    "&state=<state>&resource=" +
    resource;

  // State variable persists throughout the app lifetime
  app.locals.state = "";

  app.get("/auth", function (req, res) {
    // Create a random string to use against XSRF
    crypto.randomBytes(48, function (ex, buf) {
      app.locals.state = buf
        .toString("base64")
        .replace(/\//g, "_")
        .replace(/\+/g, "-");

      // Construct auth code request URL
      var authorizationUrl = templateAuthzUrl.replace(
        "<state>",
        app.locals.state
      );

      res.redirect(authorizationUrl);
    });
  });

  app.get("/redirect", function (req, res) {
    // Compare state parameter against XSRF
    if (app.locals.state !== req.query.state) {
      res.send("error: state does not match");
    }

    // Initialize an AuthenticationContext object
    var authenticationContext = new adal.AuthenticationContext(authorityUrl);

    // Exchange auth code for tokens
    authenticationContext.acquireTokenWithAuthorizationCode(
      req.query.code,
      redirectUri,
      resource,
      clientId,
      clientSecret,
      function (err, response) {
        res.send(response);
      }
    );
  });
};
