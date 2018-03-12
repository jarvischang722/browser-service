const Version = require('../schema/version')
const { validate, getSchema, T } = require('../validator')

const SCHEMA = {
  platform: T.string().valid(['windows', 'android', 'mac']).required(),
  client: T.string().required(),
}

module.exports = (route, config, exempt) => {
  const getVersion = async (req, res, next) => {
    try {
      validate(req.query, getSchema(SCHEMA, 'platform', 'client'))
      const { platform, client } = req.query
      const version = await Version.getVersion(platform, client)
      return res.json(version)
    } catch (err) {
      return next(err)
    }
  }

  exempt('/browser/version')

  route.get('/browser/version', getVersion)
}
