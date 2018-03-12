const Short = require('../schema/short')
const { validate, getSchema, T } = require('../validator')
const CONST = require('../schema/const')
const errors = require('../error')

const SCHEMA = {
  q: T.string(),
  page: T.number().integer().min(1).default(1),
  pagesize: T.number().integer().min(1).default(10),
}

module.exports = (route, config, exempt) => {
  const getLong = async (req, res, next) => {
    try {
      validate(req.query, getSchema(SCHEMA, 'q'))
      const long = await Short.getLong(req.query.q)
      return res.json(long)
    } catch (err) {
      return next(err)
    }
  }

  const getList = async (req, res, next) => {
    try {
      if (req.user.id !== CONST.ADMIN_ID) throw new errors.NoPermissionError()
      const { page, pagesize } = validate(req.query, getSchema(SCHEMA, 'page', 'pagesize'))
      const long = await Short.getList(page, pagesize)
      return res.json(long)
    } catch (err) {
      return next(err)
    }
  }

  const getDetail = async (req, res, next) => {
    try {
      if (req.user.id !== CONST.ADMIN_ID) throw new errors.NoPermissionError()
      const { page, pagesize } = validate(req.query, getSchema(SCHEMA, 'page', 'pagesize'))
      const long = await Short.getDetail(page, pagesize)
      return res.json(long)
    } catch (err) {
      return next(err)
    }
  }

  const updateShort = async (req, res, next) => {
    try {
      if (req.user.id !== CONST.ADMIN_ID) throw new errors.NoPermissionError()
      const { page, pagesize } = validate(req.query, getSchema(SCHEMA, 'page', 'pagesize'))
      const long = await Short.updateShort(page, pagesize)
      return res.json(long)
    } catch (err) {
      return next(err)
    }
  }

  exempt('/browser/short')

  route.get('/browser/short', getLong)
  route.get('/short/list', getList)
  route.get('/short', getDetail)
  route.post('/short', updateShort)
}
