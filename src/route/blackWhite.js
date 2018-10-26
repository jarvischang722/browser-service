const errors = require('../error')
const BlackWhite = require('../schema/blackWhite')
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
  userid: T.number().integer().required(),
  blackList: T.string().allow('', null),
  whiteList: T.string().allow('', null),
}


const ERRORS = {
}

errors.register(ERRORS)

module.exports = (route, config, exempt) => {
  const getList = async (req, res, next) => {
    try {
      const { page, pagesize } = validate(req.query, getSchema(SCHEMA, 'page', 'pagesize'))
      const list = await BlackWhite.getList(page, pagesize)
      return res.json(list)
    } catch (err) {
      return next(err)
    }
  }

  const getDetail = async (req, res, next) => {
    try {
      const { userid } = validate(req.query, getSchema(SCHEMA, 'userid'))
      const results = await BlackWhite.getDetail(userid)
      return res.json(results)
    } catch (err) {
      return next(err)
    }
  }

  const update = async (req, res, next) => {
    try {
      validate(req.body, getSchema(SCHEMA, 'userid', 'blackList', 'whiteList'))
      const result = await BlackWhite.update(req)
      return res.json(result)
    } catch (err) {
      return next(err)
    }
  }

  /**
   * @api {get} /blackWhite/list 黑白名單列表
   * @apiVersion 1.0.0
   * @apiGroup BlackWhite
   * @apiDescription 黑白名單列表
   *
   * @apiUse HeaderInfo
   *
   * @apiParam {Number{>=1}} [page=1]  页码
   * @apiParam {Number{>=1}} [pagesize=10]  每页数量
   *
   * @apiSuccess (Success 200) {Number} total
   * @apiSuccess (Success 200) {Object[]} items
   * @apiSuccess (Success 200) {Number} items.userid Agent id
   * @apiSuccess (Success 200) {String} items.name  Agent 名
   * @apiSuccess (Success 200) {String} items.black_list 黑名單列表
   * @apiSuccess (Success 200) {Number} items.white_list 白名單列表
   *
   * @apiSuccessExample Success-Response:
   * HTTP Status: 200
   * {
      "total": 20,
      "items": [
        {
            "userid": 1,
            "name": "合众科技",
            "black_list": "192.168.1.5",
            "white_list": "192.233.23.5,192.168.20.0/24"
        },
        {
            "userid": 2,
            "name": "澳门新葡京",
            "black_list": "192.168.1.5,192.168.2.6",
            "white_list": "168.198.2.3"
        },
        ...
      ]
   * }
   *
   * @apiUse UnauthorizedError
   * @apiUse PlayerNotFoundError
   *
   */
  route.get('/blackWhite/list', getList)

  /** @api {get} /blackWhite/detail Agent 黑白名單
   * @apiVersion 1.0.0
   * @apiGroup BlackWhite
   * @apiDescription Agent 黑白名單
   *
   * @apiUse HeaderInfo
   *
   * @apiParam {Number} userid agent id
   *
   * @apiSuccess (Success 200) {Number} userid
   * @apiSuccess (Success 200) {String} name
   * @apiSuccess (Success 200) {String} black_list
   * @apiSuccess (Success 200) {String} white_list
   *
   * @apiSuccessExample Success-Response:
   * HTTP Status: 200
   * {
        "userid": 1,
        "name": "合众科技",
        "black_list": "192.168.1.5",
        "white_list": "192.233.23.5,192.168.20.0/24"
   * }
   *
   * @apiUse UnauthorizedError
   */
  route.get('/blackWhite/detail', getDetail)

  /** @api {get} /blackWhite/update 更新黑白名單
   * @apiVersion 1.0.0
   * @apiGroup BlackWhite
   * @apiDescription 更新黑白名單
   *
   * @apiUse HeaderInfo
   *
   * @apiParam {Number} userid Agent ID
   * @apiParam {String} [blackList] 黑名單
   * @apiParam {String} [whiteList] 白名單
   *
   * @apiSuccess (Success 200) {Number} userid
   * @apiSuccess (Success 200) {String} name
   * @apiSuccess (Success 200) {String} black_list
   * @apiSuccess (Success 200) {String} white_list
   *
   * @apiSuccessExample Success-Response:
   * HTTP Status: 200
   * {
        "userid": 5,
        "name": "澳门葡京",
        "black_list": "192.168.10.0/24",
        "white_list": ""
   * }
   *
   * @apiUse UnauthorizedError
   */
  route.post('/blackWhite/update', update)
}
