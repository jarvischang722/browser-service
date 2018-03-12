const Short = require('../schema/short')
const { validate, getSchema, T } = require('../validator')
const CONST = require('../schema/const')
const errors = require('../error')

const SCHEMA = {
  q: T.string(),
  page: T.number().integer().min(1).default(1),
  pagesize: T.number().integer().min(1).default(10),
}

const ERRORS = {
  ShortItemNotFound: 404,
}

errors.register(ERRORS)

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
      validate(req.query, getSchema(SCHEMA, 'id'))
      const result = await Short.getDetail(req.query.id)
      return res.json(result)
    } catch (err) {
      return next(err)
    }
  }

  const updateShort = async (req, res, next) => {
    try {
      if (req.user.id !== CONST.ADMIN_ID) throw new errors.NoPermissionError()
      const { id, short, long, site_name, logo_url } = validate(req.body, getSchema(
        SCHEMA, 'id', 'short', 'long', 'site_name', 'logo_url')
      )
      const result = await Short.updateShort(id, short, long, site_name, logo_url)
      return res.json(result)
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
