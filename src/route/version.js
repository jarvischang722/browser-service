const User = require('../schema/user')
const Version = require('../schema/version')
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

  const addBrowserInfo = async (req, res, next) => {
    try {
      validate(req.body, getSchema(SCHEMA, 'id', 'platform', 'link', 'version'))
      const tarId = req.body ? req.body.id : null
      const profile = await User.getProfile(req.user.id, tarId, config)
      const { id } = profile
      const { platform, link, version } = req.body
      await Version.addBrowserInfo(id, platform, link, version)
      return res.status(204).send()
    } catch (err) {
      return next(err)
    }
  }

  const updateBrowserInfo = async (req, res, next) => {
    try {
      validate(req.body, getSchema(SCHEMA, 'id', 'platform', 'link', 'version'))
      const tarId = req.body ? req.body.id : null
      const profile = await User.getProfile(req.user.id, tarId, config)
      const { id } = profile
      const { platform, link, version } = req.body
      await Version.updateBrowserInfo(id, platform, link, version)
      return res.status(204).send()
    } catch (err) {
      return next(err)
    }
  }

  const getBrowserList = async (req, res, next) => {
    try {
      const results = await Version.getBrowserList(req.user.id)
      return res.json(results)
    } catch (err) {
      return next(err)
    }
  }

  const getBrowserDetail = async (req, res, next) => {
    try {
      const results = await Version.getBrowserDetail(req.user.id)
      return res.json(results)
    } catch (err) {
      return next(err)
    }
  }

  exempt('/browser/version')

  route.get('/browser/version', getVersion)

  route.post('/browser/add', addBrowserInfo)
  route.post('/browser/update', updateBrowserInfo)
  route.get('/browser/list', getBrowserList)
  route.get('/browser/detail', getBrowserDetail)
}
