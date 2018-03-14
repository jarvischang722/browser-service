const multer = require('multer')
const Short = require('../schema/short')
const { validate, getSchema, T } = require('../validator')
const CONST = require('../schema/const')
const errors = require('../error')

const SCHEMA = {
  q: T.string(),
  page: T.number().integer().min(1).default(1),
  pagesize: T.number().integer().min(1).default(10),
  id: T.number().integer().min(1).required(),
  short: T.string().required(),
  long: T.string().required(),
  site_name: T.string(),
  logo_url: T.string(),
}

const ERRORS = {
  AddShortItemFailed: 400,
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

  const addShort = async (req, res, next) => {
    try {
      if (req.user.id !== CONST.ADMIN_ID) throw new errors.NoPermissionError()
      validate(req.body, getSchema(
        SCHEMA, 'short', 'long', 'site_name')
      )
      const result = await Short.addShort(req)
      return res.json(result)
    } catch (err) {
      return next(err)
    }
  }

  const updateShort = async (req, res, next) => {
    try {
      if (req.user.id !== CONST.ADMIN_ID) throw new errors.NoPermissionError()
      validate(req.body, getSchema(
        SCHEMA, 'id', 'short', 'long', 'site_name', 'logo_url')
      )
      const result = await Short.updateShort(req)
      return res.json(result)
    } catch (err) {
      return next(err)
    }
  }

  const storage = multer.diskStorage({
    destination: 'upload/image',
    filename: (req, file, cb) => {
      cb(null, `${req.body.short}.png`)
    }
  })

  exempt('/browser/short')

  route.get('/browser/short', getLong)
  route.get('/short/list', getList)
  route.get('/short/detail', getDetail)
  route.post('/short/add', multer({ storage }).single('image'), addShort)
  route.post('/short/update', multer({ storage }).single('image'), updateShort)
}
