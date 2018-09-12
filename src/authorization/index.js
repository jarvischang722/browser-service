const jwt = require('jsonwebtoken')
const errors = require('../error')
const exemptions = require('./exemptions')
const log4js = require('log4js')

const logger = log4js.getLogger()
const exempted = req => {
  if (!exemptions.has(req.url)) {
    const user = req.user
    if (!user || !user.id || !user.token) {
      return new errors.UnauthorizedError()
    }
  }
}

const authorize = config => {
  const auth = (req, res, next) => {
    try {
      const token = req.headers['x-auth-key']
      if (token) {
        const credentials = jwt.verify(token, config.secret.jwt)
        req.user = {
          id: credentials.userId,
          role: credentials.role,
          token
        }
      }
      next(exempted(req))
    } catch (err) {
      logger.error(err)
      return next(err)
    }
  }
  return auth
}

const generateToken = (config, userId, role) =>
  jwt.sign({ userId, role }, config.secret.jwt, config.jwtOptions)

module.exports = { authorize, generateToken }
