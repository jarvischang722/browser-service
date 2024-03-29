const multer = require('multer')
const User = require('../schema/user')
const errors = require('../error')
const { validate, getSchema, T } = require('../validator')
const { generateToken } = require('../authorization')

const SCHEMA = {
  id: T.number().integer(),
  role: T.number()
    .integer()
    .valid(1, 2)
    .default(1),
  name: T.string(),
  expireIn: T.date()
    .timestamp('unix')
    .raw()
    .allow(null, ''),
  username: T.string().required(),
  password: T.string().required(),
  homeUrl: T.alternatives()
    .try(
      T.array().items(
        T.string().uri({
          scheme: ['https']
        })
      ),
      T.string().uri({
        scheme: ['https']
      })
    )
    .required(),
  ss_domain: T.array().items(T.string()),
  icon: T.string(),
  icon_macos: T.string(),
  enable_vpn: T.number()
    .valid(0, 1)
    .allow(null)
    .default(1),
  page: T.number()
    .integer()
    .min(1)
    .default(1),
  pagesize: T.number()
    .integer()
    .min(1)
    .default(10),
  platform: T.string()
    .default('Windows')
    .valid(['Windows', 'macOS']),
  clientName: T.string().required()
}

const ERRORS = {
  NoPermission: 403,
  UserNotFound: 404,
  CreateUserFailed: 400,
  UserDuplicated: 400,
  ExpireInRequired: 400,
  InvalidExpireIn: 400,
  UserExpired: 400
}

errors.register(ERRORS)

module.exports = (route, config, exempt) => {
  const login = async (req, res, next) => {
    try {
      validate(req.body, getSchema(SCHEMA, 'username', 'password'))
      const { username, password } = req.body
      const user = await User.login(username, password, config)
      if (!user) return next(new errors.UnauthorizedError())
      user.token = generateToken(config, user.id, user.role)
      return res.json(user)
    } catch (err) {
      return next(err)
    }
  }

  const recurrent = async (req, res, next) => {
    try {
      const user = await User.getUser(req.user.id)
      if (!user) return next(new errors.UnauthorizedError())
      user.token = generateToken(config, user.id, user.role)
      return res.json(user)
    } catch (err) {
      return next(err)
    }
  }

  const getProfile = async (req, res, next) => {
    try {
      const validatedData = validate(req.query, getSchema(SCHEMA, 'id', 'platform'))
      const platform = validatedData.platform
      const user = await User.getProfile(req.user.id, req.query.id, config, platform)
      if (!user) return next(new errors.UserNotFoundError())
      return res.json(user)
    } catch (err) {
      return next(err)
    }
  }

  const updateProfile = async (req, res, next) => {
    try {
      validate(
        req.body,
        getSchema(SCHEMA, 'id', 'name', 'homeUrl', 'icon', 'icon_macos', 'enable_vpn', 'ss_domain')
      )
      const user = await User.updateProfile(req)
      return res.json(user)
    } catch (err) {
      return next(err)
    }
  }

  const createUser = async (req, res, next) => {
    try {
      if (!req.user || req.user.role !== 1) throw new errors.NoPermissionError()
      validate(req.body, getSchema(SCHEMA, 'username', 'role', 'name', 'expireIn'))
      const user = await User.createUser(req.user.id, req.body)
      return res.status(201).send(user)
    } catch (err) {
      if (err && err.message.includes('ER_DUP_ENTRY')) {
        return next(new errors.UserDuplicatedError())
      }
      return next(err)
    }
  }

  const deleteUser = async (req, res, next) => {
    try {
      if (!req.user || req.user.role !== 1) throw new errors.NoPermissionError()
      validate(req.body, getSchema(SCHEMA, 'id'))
      const isDeleted = await User.deleteUser(req.user.id, req.body.id)
      return res.status(201).send({ isDeleted })
    } catch (err) {
      return next(err)
    }
  }

  const getChildren = async (req, res, next) => {
    try {
      if (!req.user || req.user.role !== 1) throw new errors.NoPermissionError()
      const v = validate(req.query, getSchema(SCHEMA, 'page', 'pagesize'))
      const { page, pagesize } = v
      const users = await User.getChildren(req.user.id, page, pagesize)
      return res.json(users)
    } catch (err) {
      return next(err)
    }
  }

  const changeChildExpireTime = async (req, res, next) => {
    try {
      if (!req.user || req.user.role !== 1) throw new errors.NoPermissionError()
      validate(req.body, getSchema(SCHEMA, 'id', 'expireIn'))
      const { id, expireIn } = req.body
      const user = await User.changeChildExpireTime(req.user.id, id, expireIn)
      return res.json(user)
    } catch (err) {
      return next(err)
    }
  }

  const getHomeurl = async (req, res, next) => {
    try {
      validate(req.query, getSchema(SCHEMA, 'clientName'))
      const { clientName } = req.query
      const homeUrlList = await User.getHomeUrlByClientName(clientName)
      return res.json({ homeUrlList })
    } catch (err) {
      return next(err)
    }
  }

  const storage = multer.diskStorage({
    destination: 'upload/icon',
    filename: (req, file, cb) => {
      const tarId = req.body.id || req.user.id
      if (file.originalname.indexOf('.ico') > -1) {
        cb(null, `${tarId}.ico`)
      } else {
        cb(null, `${tarId}.png`)
      }
    }
  })

  exempt('/user/login')
  exempt('/user/getHomeurl')

  /**
   * @api {post} /user/login 登陆
   * @apiVersion 1.0.0
   * @apiGroup User
   * @apiDescription 登陆
   *
   * @apiParam {String} username  用户名
   * @apiParam {String} password  密码
   *
   * @apiSuccess (Success 200) {Number} id
   * @apiSuccess (Success 200) {Number} role
   * @apiSuccess (Success 200) {String} token
   *
   * @apiSuccessExample Success-Response:
   * HTTP Status: 200
   * {
   *    "id": 1,
   *    "role": 1,
   *    "token": "eyXhwIjoxNTE0MzQ2NzQwfQ.FXJyQ3MFNmyTIvbXodpvJWycV4Io2iAevdKzts......gvTLQ"
   * }
   *
   */
  route.post('/user/login', login)
  /**
   * @api {get} /user/recurrent recurrent
   * @apiVersion 1.0.0
   * @apiGroup User
   * @apiDescription recurrent
   *
   * @apiSuccess (Success 200) {Number} id
   * @apiSuccess (Success 200) {Number} role
   * @apiSuccess (Success 200) {String} token
   *
   * @apiSuccessExample Success-Response:
   * HTTP Status: 200
   * {
   *    "id": 1,
   *    "role": 1,
   *    "token": "eyXhwIjoxNTE0MzQ2NzQwfQ.FXJyQ3MFNmyTIvbXodpvJWycV4Io2iAevdKzts......gvTLQ"
   * }
   *
   */
  route.get('/user/recurrent', recurrent)
  /**
* @api {get} /user/profile 获取用户信息
* @apiVersion 1.0.0
* @apiGroup User
* @apiDescription 获得目标用户的信息
*
* @apiParam {Number} id  用户id
*
* @apiSuccess (Success 200) {Number} id
* @apiSuccess (Success 200) {Number} role
* @apiSuccess (Success 200) {String} username
* @apiSuccess (Success 200) {String} name
* @apiSuccess (Success 200) {String} name
* @apiSuccess (Success 200) {String} expireIn
* @apiSuccess (Success 200) {Object} browser
* @apiSuccess (Success 200) {String} browser.link
* @apiSuccess (Success 200) {Object} browser.version
* @apiSuccess (Success 200) {String} browser.version.local
* @apiSuccess (Success 200) {String} browser.version.server
* @apiSuccess (Success 200) {String} icon
* @apiSuccess (Success 200) {Array} homeUrl
*
* @apiSuccessExample Success-Response:
* HTTP Status: 200
{
   "id": 1,
   "role": 1,
   "username": "tripleone",
   "name": "合众科技",
   "expireIn": "1510641466",
   "browser": {
       "link": "/download/safety-browser-tripleone-setup-2.9.0.exe",
       "version": {
           "local": "2.9.0",
           "server": "2.9.2"
       }
   },
   "icon": "/icon/tripleone.ico",
   "homeUrl": [
       "https://www.tripleonetech.com",
       "https://www.tripleonetech.net"
   ]
}
*
*/
  route.get('/user/profile', getProfile)
  /**
* @api {post} /user/profile 更新用户信息
* @apiVersion 1.0.0
* @apiGroup User
* @apiDescription 更新目标用户的信息
*
* @apiParam {Number{>=1}} [id]  用户id
* @apiParam {String} name  名称
* @apiParam {String[]} homeUrl  主页列表
* @apiParam {String} icon  用户图标
*
* @apiSuccess (Success 200) {Number} id
* @apiSuccess (Success 200) {String} name
* @apiSuccess (Success 200) {String} icon
* @apiSuccess (Success 200) {Array} homeUrl
*
* @apiSuccessExample Success-Response:
* HTTP Status: 200
{
  "id": 1,
  "name": "合众科技",
  "icon": "/icon/tripleone.ico",
  "homeUrl": [
      "https://www.tripleonetech.com",
      "https://www.tripleonetech.net"
  ]
}
*
*/
  route.post(
    '/user/profile',
    multer({ storage }).fields([{ name: 'icon' }, { name: 'icon_macos' }]),
    updateProfile
  )

  /**
* @api {post} /user/create  创建下级代理/客户
* @apiVersion 1.0.0
* @apiGroup User
*
* @apiParam {String} username  用户名(唯一)
* @apiParam {String} name  名称
* @apiParam {Number=1,2} role  权限 1: 代理 2: 客户
* @apiParam {Date} expireIn  过期时间, 不能超过自己的
*
* @apiSuccess (Success 201) {Number} id
* @apiSuccess (Success 201) {String} username
* @apiSuccess (Success 201) {String} password
*
* @apiSuccessExample Success-Response:
* HTTP Status: 201
{
  "id": 10,
  "username": "tripleone",
  "password": "pass1234"
}
*/
  route.post('/user/create', createUser)
  /**
* @api {get} /user/list  获取下级用户列表
* @apiVersion 1.0.0
* @apiGroup User
*
* @apiParam {Number{>=1}} [page=1]  页码
* @apiParam {Number{>=1}} [pagesize=10]  每页数量
*
* @apiSuccess (Success 200) {Number} id
* @apiSuccess (Success 200) {String} username
* @apiSuccess (Success 200) {String} password
*
* @apiSuccessExample Success-Response:
* HTTP Status: 200
{
  "total": 10,
  "items": [
      {
          "id": 1,
          "role": 1,
          "username": "tripleone",
          "name": "合众科技",
          "expireIn": "1510641466"
      }
  ]
}
*/
  route.get('/user/list', getChildren)
  /**
* @api {post} /user/expire  修改下级代理过期时间
* @apiVersion 1.0.0
* @apiGroup User
*
* @apiParam {String} id  用户id
* @apiParam {Date} expireIn  过期时间, 不能超过自己的
*
* @apiSuccess (Success 201) {Number} id
* @apiSuccess (Success 201) {String} expireIn
*
* @apiSuccessExample Success-Response:
* HTTP Status: 201
{
  "id": 10,
  "expireIn": "1510641466"
}
*/
  route.post('/user/expire', changeChildExpireTime)

  /**
* @api {get} /user/getHomeurl  取得首頁列表
* @apiVersion 1.0.0
* @apiGroup User
*
* @apiParam {String} clientName  用户名稱
*
* @apiSuccess (Success 200) {Array} homeUrlList
*
* @apiSuccessExample Success-Response:
* HTTP Status: 200
{
  "homeUrlList": ["https://www.9896b.xyz", "https://www.9896b.xyz"]
}
*/
  route.get('/user/getHomeurl', getHomeurl)

  /**
* @api {post} /user/delete  刪除agent
* @apiVersion 1.0.0
* @apiGroup User
*
* @apiParam {String} id  用户ID
*
* @apiSuccess (Success 200) {Boolean} isDeleted
*
* @apiSuccessExample Success-Response:
* HTTP Status: 200
{
  "isDeleted": true
}
*/
  route.post('/user/delete', deleteUser)
}
