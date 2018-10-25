const errors = require('../error')
const Player = require('../schema/player')
const { validate, getSchema, T } = require('../validator')

const SCHEMA = {
  page: T.number()
    .integer()
    .min(1)
    .default(1),
  pagesize: T.number()
    .integer()
    .min(1)
    .default(10),
  playerId: T.number()
    .integer()
    .required(),
  status: T.string()
    .required()
    .valid('0', '1'),
  disableExpire: T.date().allow('', null),
  username: T.string().required(),
  password: T.string().required(),
  playerName: T.string().required(),
  contactNum: T.string().required(),
  email: T.string().email()
}

const ERRORS = {
  PlayerNotFound: 404
}

module.exports = (route, config, exempt) => {
  const register = async (req, res, next) => {
    try {
      validate(req.body, getSchema(SCHEMA, 'username', 'password', 'playerName', 'contactNum', 'email'))
      const regData = req.body
      const user = await Player.register(regData)
      if (user) {
        res.json({ success: true, user })
      } else {
        res.json({ success: false, message: 'Register failed', user })
      }
    } catch (err) {
      next(err)
    }
  }

  const getList = async (req, res, next) => {
    try {
      const { page, pagesize } = validate(req.body, getSchema(SCHEMA, 'page', 'pagesize'))
      const list = await Player.getList(page, pagesize)
      return res.json(list)
    } catch (err) {
      return next(err)
    }
  }

  const getDetail = async (req, res, next) => {
    try {
      const { playerId } = validate(req.query, getSchema(SCHEMA, 'playerId'))
      const player = await Player.getDetail(playerId)
      return res.json(player)
    } catch (err) {
      return next(err)
    }
  }

  const updateSta = async (req, res, next) => {
    try {
      validate(req.body, getSchema(SCHEMA, 'playerId', 'status', 'disableExpire'))
      const result = await Player.updatePlayerSta(req)
      return res.json(result)
    } catch (err) {
      return next(err)
    }
  }

  /**
   * @apiDefine PlayerNotFoundError
   * @apiError PlayerNotFoundError The <code>PlyerId</code> of the User was not found.
   *
   * @apiErrorExample {json} PlayerNotFoundError-Response:
   * HTTP/1.1 400
   * {
      "error": {
          "code": "PlayerNotFoundError",
          "message": "未找到指定玩家"
      }
   * }
   */
  exempt('/player/register')
  route.post('/player/register', register)

  /**
   * @api {post} /player/list  玩家列表
   * @apiVersion 1.0.0
   * @apiGroup Player
   * @apiDescription 玩家列表
   *
   * @apiUse HeaderInfo
   *
   * @apiParam {Number{>=1}} [page=1]  页码
   * @apiParam {Number{>=1}} [pagesize=10]  每页数量
   *
   * @apiSuccess (Success 200) {Number} total 筆數
   * @apiSuccess (Success 200) {Object[]} items
   * @apiSuccess (Success 200) {Number} items.id 玩家編號
   * @apiSuccess (Success 200) {String} items.username
   * @apiSuccess (Success 200) {String}  items.name
   * @apiSuccess (Success 200) {String} items.contact_number
   * @apiSuccess (Success 200) {String} items.email
   * @apiSuccess (Success 200) {String} items.gender 性別
   * @apiSuccess (Success 200) {String} items.birthdate 生日
   * @apiSuccess (Success 200) {String} items.status 玩家停用狀態
   * @apiSuccess (Success 200) {String} items.disable_expire 停用到期時間
   *
   * @apiSuccessExample Success-Response:
   * HTTP Status: 200
   * {
        "total": 2,
        "items": [
            {
                "id": 2,
                "username": "abc123",
                "name": "aaa",
                "contact_number": "aaa",
                "email": null,
                "gender": null,
                "birthdate": null,
                "status": "1",
                "disable_expire": null
            },
            {
                "id": 1,
                "username": "jun",
                "name": "jun",
                "contact_number": "09123456879",
                "email": null,
                "gender": null,
                "birthdate": null,
                "status": "1",
                "disable_expire": null
            }
        ],
        ...
   * }
   *
   * @apiUse UnauthorizedError
   */

  route.post('/player/list', getList)

  /** @api {get} /player/detail 玩家資訊
   * @apiVersion 1.0.0
   * @apiGroup Player
   * @apiDescription 玩家資訊
   *
   * @apiUse HeaderInfo
   *
   * @apiParam {Number} playerId 玩家編號
   *
   * @apiSuccess (Success 200) {Number} id
   * @apiSuccess (Success 200) {String} username
   * @apiSuccess (Success 200) {String} name
   * @apiSuccess (Success 200) {Array} contact_number
   * @apiSuccess (Success 200) {String} email
   * @apiSuccess (Success 200) {String} gender
   * @apiSuccess (Success 200) {String} birthdate
   * @apiSuccess (Success 200) {String} status
   * @apiSuccess (Success 200) {Date} disable_expire
   *
   * @apiSuccessExample Success-Response:
   * HTTP Status: 200
   * {
        "id": 1,
        "username": "test",
        "name": "test",
        "contact_number": "09123456879",
        "email": null,
        "gender": null,
        "birthdate": null,
        "status": "1",
        "disable_expire": null
   * }
   *
   * @apiUse PlayerNotFoundError
   */

  route.get('/player/detail', getDetail)

  /** @api {post} /player/updateSta 更新玩家狀態
   * @apiVersion 1.0.0
   * @apiGroup Player
   * @apiDescription 更新玩家狀態
   *
   * @apiUse HeaderInfo
   *
   * @apiParam {Number} playerId 玩家編號
   * @apiParam {Number} status 玩家狀態
   * @apiParam {Number} [disableExpire] 玩家
   *
   * @apiSuccess (Success 200) {Number} id
   * @apiSuccess (Success 200) {String} name
   * @apiSuccess (Success 200) {String} status
   * @apiSuccess (Success 200) {Date} disable_expire
   *
   * @apiSuccessExample Success-Response:
   * HTTP Status: 200
   * {
      "id": 1,
      "name": "test",
      "status": "1",
      "disable_expire": null
   * }
   *
   * @apiUse PlayerNotFoundError
   */
  route.post('/player/updateSta', updateSta)
}
