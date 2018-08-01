const User = require('../schema/user')
const Version = require('../schema/version')
const { validate, getSchema, T } = require('../validator')

const SCHEMA = {
  id: T.number().integer().required(),
  user: T.number().integer(),
  platform: T.string().valid(['Windows', 'windows', 'mac', 'macOS', 'iOS', 'Android']).required(),
  client: T.string().required(),
  link: T.string().uri().required(),
  version: T.string().required(),
  q: T.string(),
}

module.exports = (route, config, exempt) => {
  const getUserId = async (req) => {
    const tarId = (req.body && req.body.user) || (req.query && req.query.user) || null
    const platform = req.body.platform
    const profile = await User.getProfile(req.user.id, tarId, config, platform)
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
  /**
* @api {post} /browser/info 新增或更新版本号
* @apiVersion 1.0.0
* @apiGroup Version
*
* @apiParam {Number} user  短地址 用户id
* @apiParam {String="Windows","mac","ios","android"} platform  平台
* @apiParam {String} link 长地址
* @apiParam {String} version  网站名称
*
* @apiSuccessExample Success-Response:
* HTTP Status: 204
*
*/
  route.post('/browser/info', updateBrowserInfo)
  /**
* @api {get} /browser/list 获取某客户下版本号列表
* @apiVersion 1.0.0
* @apiGroup Version
*
* @apiParam {Number{>=1}} user  用户id
*
* @apiSuccess (Success 200) {Number} total
* @apiSuccess (Success 200) {Object[]} items
* @apiSuccess (Success 200) {Number} items.id
* @apiSuccess (Success 200) {String} items.platform
* @apiSuccess (Success 200) {String} items.link
* @apiSuccess (Success 200) {String} items.version
*
* @apiSuccessExample Success-Response:
* HTTP Status: 200
{
 "total": 10,
 "items": [
   {
     "id": 1,
     "platform": "ios",
     "link": "apple.com",
     "version": "xxx"
   }
 ]
}
*
*/
  route.get('/browser/list', getBrowserList)
  /**
* @api {get} /browser/detail 获取版本号详情
* @apiVersion 1.0.0
* @apiGroup Version
*
* @apiParam {Number{>=1}} user  用户id
*
* @apiSuccess (Success 200) {Number} id
* @apiSuccess (Success 200) {String} platform
* @apiSuccess (Success 200) {String} link
* @apiSuccess (Success 200) {String} version
*
* @apiSuccessExample Success-Response:
* HTTP Status: 200
{
 "id": 1,
 "platform": "ios",
 "link": "apple.com",
 "version": "xxx"
}
*
*/
  route.get('/browser/detail', getBrowserDetail)
}
