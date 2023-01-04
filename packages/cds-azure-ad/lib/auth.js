// Import Libraries
const cds = require('@sap/cds')
const chalk = require('chalk')
const xsenv = require('@sap/xsenv')
const passport = require('passport')
const { BearerStrategy } = require('passport-azure-ad')

// To debug this module set export DEBUG=cds-azure-ad
const DEBUG = cds.debug('cds-azure-ad')

// Read configuration from VCAP_SERVICES environment variable
xsenv.loadEnv()
let services = {}
try {
  services = xsenv.getServices({ azuread: { tag: 'azure-ad' } })
} catch (error) {
  console.error(chalk.red(`[cds-azure-ad] - ${error.message}`))
  console.error('[cds-azure-ad] - maintain default-env.json or provide the environment variable VCAP_SERVICES')
  throw new Error(error.message)
}

const AzureADB2CUser = class extends cds.User {
  is(role) {
    DEBUG && DEBUG(`Requested role: ${role}`)
    return role === 'any' || this._roles[role]
  }
}

function formatSchema(tenantID) {
  // postgreSQL does not allow first character "0" in schema name
  let schema = `_${tenantID}`
  // postgreSQL seems to error when passing '-' to schema name
  schema = schema.replace(/-/g, '')
  return schema
}

module.exports = (req, res, next) => {
  const options = services.azuread
  passport.initialize()
  passport.use(
    new BearerStrategy(options, (token, done) => {
      DEBUG && DEBUG('verifying the user')
      DEBUG && DEBUG(token, 'was the token retreived')
      const user = token.oid
      return done(null, user, token)
    })
  )
  passport.authenticate('oauth-bearer', (err, user, token) => {
    let capUser = {
      id: '',
      _roles: [],
    }
    if (err) {
      DEBUG && DEBUG('err')
      DEBUG && DEBUG(err)
      return next(err)
    }
    if (!user) {
      DEBUG && DEBUG('No user')
      return next(Error(token))
    }
    DEBUG && DEBUG('token')
    DEBUG && DEBUG(token)

    const roles = token.roles || []

    return next(Error(token))

    capUser = {
      id: token.preferred_username,
      accessToken: req.get('authorization'),
      tenant: token.tid,
      schema: formatSchema(token.tid),
      _roles: ['authenticated-user', ...roles],
    }

    req.user = new AzureADB2CUser(capUser)
    req.user.attr.tenant = token.tid // !Important: SAP CAP-restrictions access req.user.attr in order to look for the tenant
    req.user.attr.user = token.preferred_username

    next()
  })(req, res, next)
}
