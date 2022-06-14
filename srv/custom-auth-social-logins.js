const cds = require("@sap/cds");

module.exports = (req, res, next) => {
  if (req?.user) {
    req.user = new cds.User(req.user);
    next();
  } else {
    res.status(401).send();
  }
};
