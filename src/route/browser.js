const User = require('../schema/user')
const Browser = require('../schema/browser')
const Short = require('../schema/short')
const errors = require('../error')
const { validate, getSchema, T } = require('../validator')

const SCHEMA = {
  id: T.number().integer(),
  platform: T.string().valid(['windows', 'android', 'mac']).required(),
  client: T.string().required(),
  link: T.string().uri().required(),
  version: T.string().required(),
  q: T.string(),
}

const ERRORS = {
  CreateBrowserFailed: 400,
  NameRequired: 400,
  IconRequired: 400,
  HomeUrlRequired: 400,
}

errors.register(ERRORS)

module.exports = (route, config, exempt) => {
  const getVersion = async (req, res, next) => {
    try {
      validate(req.query, getSchema(SCHEMA, 'platform', 'client'))
      const { platform, client } = req.query
      const version = await Browser.getVersion(platform, client)
      return res.json(version)
    } catch (err) {
      return next(err)
    }
  }

  const createNewBrowser = async (req, res, next) => {
    try {
      validate(req.body, getSchema(SCHEMA, 'id'))
      const tarId = req.body ? req.body.id : null
      const profile = await User.getProfile(req.user.id, tarId, config)
      // 信息不全的不允许生成浏览器
      if (!profile || !profile.username) throw new errors.UserNotFoundError()
      if (!profile.name) throw new errors.NameRequiredError()
      if (!profile.icon) throw new errors.IconRequiredError()
      if (!profile.homeUrl) throw new errors.HomeUrlRequiredError()
      // await Browser.createBrowser(config, profile)
      const { id } = profile
      await Browser.updateCreatingBrowserStatus(id, 'windows')
      Browser.createBrowser(config, profile)
      return res.status(204).send()
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

  const getLong = async (req, res, next) => {
    try {
      validate(req.query, getSchema(SCHEMA, 'q'))
      const long = await Short.getLong(req.query.q)
      return res.json(long)
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

  exempt('/browser/short')
  exempt('/browser/version')

  route.get('/browser/short', getLong)
  route.get('/browser/version', getVersion)
  route.post('/browser/create', createNewBrowser)
  route.get('/browser/info', getBrowserInfo)
  route.post('/browser/info', updateBrowser)
  route.get('/browser/list', getBrowserList)
}
