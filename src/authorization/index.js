const jwt = require('jsonwebtoken')
const errors = require('../error')
const exemptions = require('./exemptions')

const exempted = (req) => {
    if (!exemptions.has(req.url)) {
        const user = req.user
        if (!user || !user.id || !user.token) {
            return new errors.UnauthorizedError()
        }
    }
}

const authorize = (config) => {
    const auth = (req, res, next) => {
        const token = req.headers['x-auth-key']
        if (token) {
            const credentials = jwt.verify(token, config.secret.jwt)
            req.user = {
                id: credentials.userId,
                token,
            }
        }
        next(exempted(req))
    }
    return auth
}

const generateToken = (config, userId) => {
    return jwt.sign({ userId }, config.secret.jwt, config.jwtOptions)
}

module.exports = { authorize, generateToken }
