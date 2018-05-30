const User = require('../schema/user')
const Browser = require('../schema/browser')
const errors = require('../error')
const { validate, getSchema, T } = require('../validator')

const SCHEMA = {
  id: T.number().integer(),
}

const ERRORS = {
  CreateBrowserFailed: 400,
  NameRequired: 400,
  IconRequired: 400,
  HomeUrlRequired: 400,
  BrowserInfoNotFound: 404,
}

errors.register(ERRORS)

module.exports = (route, config, exempt) => {
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
      const { id } = profile
      await Browser.updateCreatingBrowserStatus(id, 'Windows')
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

  route.post('/browser/create', createNewBrowser)
  route.get('/browser/info', getBrowserInfo)
}
