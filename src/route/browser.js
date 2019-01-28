const log4js = require('log4js')
const User = require('../schema/user')
const Browser = require('../schema/browser')
const SsUtil = require('../utils/shadowsocks')
const ObjUtil = require('../utils/obj')
const errors = require('../error')
const { validate, getSchema, T } = require('../validator')
const url = require('url')
const request = require('request')
const multer = require('multer')
const STATUS = require('../schema/const').BUILD_STATUS

const log = log4js.getLogger()

const SCHEMA = {
  id: T.number().integer(),
  clientName: T.string()
    .required()
    .regex(/^\w+$/),
  platform: T.string()
    .default('Windows')
    .valid(['Windows', 'macOS'])
}

const ERRORS = {
  CreateBrowserFailed: 400,
  NameRequired: 400,
  IconRequired: 400,
  IconMacOSRequiredError: 400,
  HomeUrlRequired: 400,
  HomeUrlHttpsRequired: 400,
  BrowserInfoNotFound: 404
}

errors.register(ERRORS)

module.exports = (route, config, exempt) => {
  const createNewBrowser = async (req, res, next) => {
    let profile = {}
    let buildOfPlatform = 'Windows'
    try {
      const validatedData = validate(req.body, getSchema(SCHEMA, 'id', 'platform'))
      buildOfPlatform = validatedData.platform
      // process.platform :  win32 | linux | darwin(mac os)
      let serverOfPlatform = process.platform
      if (serverOfPlatform === 'darwin') {
        serverOfPlatform = 'macOS'
      } else if (serverOfPlatform === 'win32') {
        serverOfPlatform = 'Windows'
      }

      const tarId = req.body ? req.body.id : null
      profile = await User.getProfile(req.user.id, tarId, config, buildOfPlatform)
      // 信息不全的不允许生成浏览器
      if (!profile || !profile.username) throw new errors.UserNotFoundError()
      if (!profile.name) throw new errors.NameRequiredError()
      if (!profile.icon) throw new errors.IconRequiredError()
      if (!profile.icon_macos) throw new errors.IconMacOSRequiredError()
      if (!profile.homeUrl) throw new errors.HomeUrlRequiredError()
      if (!Array.isArray(profile.homeUrl)) {
        profile.homeUrl = [profile.homeUrl]
      }
      profile.homeUrl.forEach(homeUrl => {
        const homeUrlParsed = url.parse(homeUrl, true)
        if (!homeUrlParsed.protocol || homeUrlParsed.protocol.indexOf('https')) {
          throw new errors.HomeUrlHttpsRequiredError()
        }
      })

      const { id } = profile
      if (buildOfPlatform !== serverOfPlatform) {
        const serviceAddr =
          buildOfPlatform === 'Windows' ? config.server.windowsAddr : config.server.macAddr
        const headers = ObjUtil.pick(req.headers, 'content-type', 'accept', 'x-auth-key')
        const options = {
          url: `${serviceAddr}/browser/create`,
          method: 'POST',
          headers,
          form: req.body
        }
        const buildCB = (error, response, body) => {
          if (error) {
            log.error(error)
            Browser.updateCreatingBrowserStatus(
              profile.id,
              buildOfPlatform,
              STATUS.FAILED,
              error.message
            )
          }
        }
        request(options, buildCB)
      } else {
        Browser.createBrowser(config, profile, buildOfPlatform)
      }
      await Browser.updateCreatingBrowserStatus(id, buildOfPlatform)
      res.status(204).send()
    } catch (err) {
      log.error(err)
      Browser.updateCreatingBrowserStatus(profile.id, buildOfPlatform, STATUS.FAILED, err.message)
      return next(err)
    }
  }

  const getBrowserInfo = async (req, res, next) => {
    try {
      const validatedData = validate(req.query, getSchema(SCHEMA, 'id', 'platform'))
      const platform = validatedData.platform
      const browser = await Browser.getBrowserInfo(req.user.id, req.query.id, config, platform)
      return res.json(browser)
    } catch (err) {
      return next(err)
    }
  }

  const getHomeUrlAndSsInfoList = async (req, res, next) => {
    try {
      validate(req.query, getSchema(SCHEMA, 'clientName'))
      const { clientName } = req.query
      const homeUrlList = await User.getHomeUrlByClientName(clientName)
      let ssList = []
      const ssServerList = config.ssServerList || []
      const results = []
      for (const ss of ssServerList) {
        results.push(SsUtil.checkSSIsAvail(ss, { timeout: 1000 }))
      }
      ssList = (await Promise.all(results)).filter(ss => typeof ss === 'object')
      return res.json({ homeUrlList, ssList })
    } catch (err) {
      return next(err)
    }
  }

  const uploadBrowserSetup = (req, res) => {
    if (req.file) {
      res.json({ success: true })
    } else {
      res.json({ success: false })
    }
  }

  const getConfig = async (req, res, next) => {
    try {
      const result = await Browser.getConfig(req)
      return res.json(result)
    } catch (err) {
      return next(err)
    }
  }

  const storage = multer.diskStorage({
    destination: 'deploy/',
    filename: (req, file, cb) => {
      cb(null, file.originalname)
    }
  })

  exempt('/browser/homeUrlAndSsInfo')
  exempt('/browser/uploadBrowserSetup')
  exempt('/browser/config')

  /**
   * @api {post} /browser/create  生成浏览器
   * @apiVersion 1.0.0
   * @apiGroup Browser
   * @apiDescription 为目标用户生成浏览器
   *
   * @apiUse HeaderInfo
   *
   * @apiParam {Number{>=1}} [id]  用户id
   * @apiParam {String=Windows,macOS} [platform='Windows']
   *
   * 說明
   *   1. 如果没有传id, 则获取自己的profile
   *   2. 如果传了id, 会判断自己是否是目标用户的上级, 如果不是, 则抛UserNotFoundError

   *
   * @apiSuccessExample Success-Response:
   * HTTP Status: 204
   *     {
   *     }
   *
   * @apiError UserNotFoundError  不是目标用户的上级
   *
   */
  route.post('/browser/create', createNewBrowser)
  /**
   * @api {get} /browser/info 获得浏览器信息
   * @apiVersion 1.0.0
   * @apiGroup Browser
   * @apiDescription 获得自己的浏览器信息
   *
   * @apiUse HeaderInfo
   *
   * @apiParam {Number{>=1}} [id]  用户id
   * @apiParam {String=Windows,macOS} [platform='Windows']
   *
   * @apiSuccessExample Success-Response:
   * HTTP Status: 200
   *     {
   *      "platform": "Windows",
   *      "link": "/download/safety-browser-tripleone-setup-2.9.0.exe",
   *      "version": {
   *        "local": "2.9.0",
   *        "server": "2.9.2"
   *       }
   *      }
   *
   *
   */
  route.get('/browser/info', getBrowserInfo)

  /**
   * @api {get} /browser/homeUrlAndSsInfo 获得用户主页以及SS
   * @apiVersion 1.0.0
   * @apiGroup Browser
   * @apiDescription 获得用户的主页以及返回可用的shadow socks资讯
   *
   *
   * @apiParam {String} clientName  用户username
   *
   * @apiSuccess (Success 200) {Array} homeUrlList 该用户所有主页
   * @apiSuccess (Success 200) {Array} ssList  可用的shadow socks资讯
   *
   * @apiSuccessExample Success-Response:
   * HTTP Status: 200
   *     {
   *       "homeUrlList": [
   *             "https://t1t.games.org/",
   *             "https://t2t.games.org/"
   *         ],
   *         "ssList": [
   *             {
   *                 "serverAddr": "35.201.204.2",
   *                 "serverPort": 19999,
   *                 "password": "dBbQMP8Nd9vyjvN",
   *                 "method": "aes-256-cfb"
   *             },
   *             {
   *                 "serverAddr": "35.201.204.2",
   *                 "serverPort": 19999,
   *                 "password": "dBbQMP8Nd9vyjvN",
   *                 "method": "aes-256-cfb"
   *             }
   *         ]
   *       }
   *
   *
   */
  route.get('/browser/homeUrlAndSsInfo', getHomeUrlAndSsInfoList)

  /**
 * @api {get} /browser/uploadBrowserSetup 上传安装档
 * @apiVersion 1.0.0
 * @apiGroup Browser
 * @apiDescription 上传Build 完的安装档到server deploy
 *
 * @apiParam {File} browserSetup :  生成後瀏覽器的檔案
 *
 * @apiSuccess (Success 200) {Boolean} success
 * @apiSuccess (Success 200) {Boolean} errorMsg
 *
 * @apiSuccessExample Success-Response:
 * HTTP Status: 200
 {
   success: true
 }
 *
 */
  route.post(
    '/browser/uploadBrowserSetup',
    multer({ storage }).single('browserSetup'),
    uploadBrowserSetup
  )

  /**
* @api {post} /browser/config 取得共用设定档
* @apiVersion 1.0.0
* @apiGroup Browser
* @apiDescription 在Mobile版的安全浏览器启动前，会先打这支API来取得初始设定
*
* @apiSuccess (Success 201) {Boolen} isVPNEnable
*
* @apiSuccessExample Success-Response:
* HTTP Status: 200
{
  isVPNEnable : false
}
*
*/
  route.get('/browser/config', getConfig)
}
