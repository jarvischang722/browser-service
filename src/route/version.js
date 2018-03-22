const User = require('../schema/user')
const Version = require('../schema/version')
const { validate, getSchema, T } = require('../validator')

const SCHEMA = {
  id: T.number().integer().required(),
  user: T.number().integer(),
  platform: T.string().valid(['windows', 'android', 'mac', 'ios']).required(),
  client: T.string().required(),
  link: T.string().uri().required(),
  version: T.string().required(),
  q: T.string(),
}

module.exports = (route, config, exempt) => {
  const getUserId = async (req) => {
    const tarId = (req.body && req.body.user) || (req.query && req.query.user) || null
    const profile = await User.getProfile(req.user.id, tarId, config)
    const { id } = profile
    return id
  }

  const getVersion = async (req, res, next) => {
    try {
      validate(req.query, getSchema(SCHEMA, 'platform', 'client'))
      const { platform, client } = req.query
      const host = `${req.protocol}://${req.get('host')}`
      const version = await Version.getVersion(platform, client, host)
      return res.json(version)
    } catch (err) {
      return next(err)
    }
  }

  const updateBrowserInfo = async (req, res, next) => {
    try {
      validate(req.body, getSchema(SCHEMA, 'user', 'platform', 'link', 'version'))
      const id = await getUserId(req)
      const { platform, link, version } = req.body
      await Version.updateBrowserInfo(id, platform, link, version)
      return res.status(204).send()
    } catch (err) {
      return next(err)
    }
  }

  const getBrowserList = async (req, res, next) => {
    try {
      validate(req.query, getSchema(SCHEMA, 'user'))
      const id = await getUserId(req)
      const host = `${req.protocol}://${req.get('host')}`
      const results = await Version.getBrowserList(id, host)
      return res.json(results)
    } catch (err) {
      return next(err)
    }
  }

  const getBrowserDetail = async (req, res, next) => {
    try {
      validate(req.query, getSchema(SCHEMA, 'id'))
      const host = `${req.protocol}://${req.get('host')}`
      const results = await Version.getBrowserDetail(req.user.id, req.query.id, host)
      return res.json(results)
    } catch (err) {
      return next(err)
    }
  }

  exempt('/browser/version')

  route.get('/browser/version', getVersion)

  route.post('/browser/info', updateBrowserInfo)
  route.get('/browser/list', getBrowserList)
  route.get('/browser/detail', getBrowserDetail)
}
