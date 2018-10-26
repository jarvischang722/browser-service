const errors = require('../error')
const Keyword = require('../schema/keyword')
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
  userid: T.number().required(),
  keyword: T.string().required(),
  keywordList: T.array()
    .required()
    .min(1)
}

const ERRORS = {}

errors.register(ERRORS)

module.exports = (route, config, exempt) => {
  const getList = async (req, res, next) => {
    try {
      const { page, pagesize } = validate(req.query, getSchema(SCHEMA, 'page', 'pagesize'))
      const list = await Keyword.getList(req.user.id, page, pagesize)
      return res.json(list)
    } catch (err) {
      return next(err)
    }
  }

  const updateKeyword = async (req, res, next) => {
    try {
      validate(req.body, getSchema(SCHEMA, 'userid', 'keyword'))
      const result = await Keyword.update(req)
      return res.json(result)
    } catch (err) {
      return next(err)
    }
  }

  const deleteKeywords = async (req, res, next) => {
    try {
      const { keywordList } = validate(req.body, getSchema(SCHEMA, 'keywordList'))
      const result = await Keyword.deleteKeywords(keywordList)
      return res.json(result)
    } catch (err) {
      return next(err)
    }
  }
  /**
   * @api {get} /keyword/list 關鍵字列表
   * @apiVersion 1.0.0
   * @apiGroup Keyword
   * @apiDescription 關鍵字列表
   *
   * @apiUse HeaderInfo
   *
   * @apiParam {Number{>=1}} [page=1]  页码
   * @apiParam {Number{>=1}} [pagesize=10]  每页数量
   *
   * @apiSuccess (Success 200) {Number} total
   * @apiSuccess (Success 200) {Object[]} items
   * @apiSuccess (Success 200) {Number} items.id
   * @apiSuccess (Success 200) {String} items.username
   * @apiSuccess (Success 200) {String} items.name
   * @apiSuccess (Success 200) {Number} items.role
   * @apiSuccess (Success 200) {String} items.expireIn
   * @apiSuccess (Success 200) {Object[]} items.keywords
   * @apiSuccess (Success 200) {Number} items.keywords.id
   * @apiSuccess (Success 200) {Number} items.keywords.userid
   * @apiSuccess (Success 200) {keyword} items.keywords.keyword
   *
   * @apiSuccessExample Success-Response:
   * HTTP Status: 200
   * {
    "total": 19,
    "items": [
        {
            "id": 20,
            "username": "laba360",
            "name": "Laba360",
            "role": 1,
            "expireIn": null,
            "keywords": [
                {
                    "id": 1,
                    "userid": 20,
                    "keyword": "fish"
                },
                {
                    "id": 2,
                    "userid": 20,
                    "keyword": "hello"
                }
            ]
        },
        {
            "id": 19,
            "username": "tailai",
            "name": "泰来娱乐",
            "role": 1,
            "expireIn": null,
            "keywords": [
                {
                    "id": 3,
                    "userid": 19,
                    "keyword": "hi"
                },
                {
                    "id": 4,
                    "userid": 19,
                    "keyword": "捕魚"
                }
            ]
        },
        ....
      ]
   * }
   *
   * @apiUse UnauthorizedError
   *
   */
  route.get('/keyword/list', getList)

  /**
   * @api {post} /keyword/update 更新關鍵字
   * @apiVersion 1.0.0
   * @apiGroup Keyword
   * @apiDescription 更新Agent 關鍵字
   *
   * @apiUse HeaderInfo
   *
   * @apiParam {Number} userid Agent id
   * @apiParam {String} keyword 關鍵字
   *
   * @apiSuccess (Success 200) {Number} insertId
   *
   * @apiSuccessExample Success-Response:
   * HTTP Status: 200
   * {
      "insertId": 6
   * }
   *
   * @apiUse UnauthorizedError
   *
   */
  route.post('/keyword/update', updateKeyword)

   /**
   * @api {post} /keyword/delete 刪除關鍵字
   * @apiVersion 1.0.0
   * @apiGroup Keyword
   * @apiDescription 刪除Agent 關鍵字
   *
   * @apiUse HeaderInfo
   *
   * @apiParam {Array} keywordList 關鍵字索引列表
   *
   * @apiSuccess (Success 200) {Number} affectedRows 影響的Row數量
   *
   * @apiSuccessExample Success-Response:
   * HTTP Status: 200
   * {
      "affectedRows": 1
   * }
   *
   * @apiUse UnauthorizedError
   *
   */
  route.post('/keyword/delete', deleteKeywords)
}
