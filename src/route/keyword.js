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

  route.get('/keyword/list', getList)
  route.post('/keyword/update', updateKeyword)
  route.post('/keyword/delete', deleteKeywords)
}
