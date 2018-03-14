const User = require('../schema/user')
const Version = require('../schema/version')
const Browser = require('../schema/browser')
const { validate, getSchema, T } = require('../validator')

const SCHEMA = {
  id: T.number().integer(),
  platform: T.string().valid(['windows', 'android', 'mac']).required(),
  client: T.string().required(),
  link: T.string().uri().required(),
  version: T.string().required(),
  q: T.string(),
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

  const getBrowserInfo = async (req, res, next) => {
    try {
      validate(req.query, getSchema(SCHEMA, 'id'))
      const browser = await Browser.getBrowserInfo(req.user.id, req.query.id, config)
      return res.json(browser)
    } catch (err) {
      return next(err)
    }
  }

  const updateBrowser = async (req, res, next) => {
    try {
      validate(req.body, getSchema(SCHEMA, 'id', 'platform', 'link', 'version'))
      const tarId = req.body ? req.body.id : null
      const profile = await User.getProfile(req.user.id, tarId, config)
      const { id } = profile
      const { platform, link, version } = req.body
      await Browser.updateBrowser(id, platform, link, version)
      return res.status(204).send()
    } catch (err) {
      return next(err)
    }
  }

  const getBrowserList = async (req, res, next) => {
    try {
      const results = await Browser.getBrowserList(req.user.id)
      return res.json(results)
    } catch (err) {
      return next(err)
    }
  }

  exempt('/browser/version')

  route.get('/browser/version', getVersion)
  route.get('/browser/info', getBrowserInfo)
  route.post('/browser/info', updateBrowser)
  route.get('/browser/list', getBrowserList)
}
