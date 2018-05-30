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
      const host = `${req.protocol}://${req.get('host')}`
      const long = await Short.getLong(req.query.q, host)
      return res.json(long)
    } catch (err) {
      return next(err)
    }
  }

  const getSsList = async (req, res, next) => {
    try {
      const ss = Short.getSsList()
      return res.json({ ss })
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
      return res.status(201).send(result)
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
    destination: 'upload/logo_url',
    filename: (req, file, cb) => {
      cb(null, `${req.body.short}.png`)
    }
  })

  exempt('/browser/short')
  exempt('/browser/ss')

  route.get('/browser/short', getLong)
  route.get('/browser/ss', getSsList)
  route.get('/short/list', getList)
  route.get('/short/detail', getDetail)
  route.post('/short/add', multer({ storage }).single('logo_url'), addShort)
  route.post('/short/update', multer({ storage }).single('logo_url'), updateShort)
}
