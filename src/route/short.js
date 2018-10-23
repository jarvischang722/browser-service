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
  /**
* @api {get} /browser/ss 获取可用shadowsocks server 列表
* @apiVersion 1.0.0
* @apiGroup Short
*
* @apiSuccess (Success 200) {String} ss shadowsockts 列表经由DES加密后再base64编码
*
* @apiSuccessExample Success-Response:
* HTTP Status: 200
{

"ss":"ydWUdlhwHrKZjC0Hg67tzF5GdkvMBB4odoPpXIUsmzpbRc1iYfpskjVHgY5b/u0TePWFQMsoi1Oy3eMiE
     3l+6JmMLQeDru3MbQMmJEpaYBD3k0DmjHr1sXEQtmy9PuI6x2v5hQrAqcIGlgRZHdXTLQ=="
}
*/
  route.get('/browser/ss', getSsList)
  /**
* @api {get} /short/list 获取短地址列表
* @apiVersion 1.0.0
* @apiGroup Short
*
* @apiParam {Number{>=1}} [page=1]  页码
* @apiParam {Number{>=1}} [pagesize=10]  每页数量
*
* @apiSuccess (Success 200) {Number} total
* @apiSuccess (Success 200) {Object[]} items
* @apiSuccess (Success 200) {String} items.id
* @apiSuccess (Success 200) {String} items.short
* @apiSuccess (Success 200) {String} items.long
* @apiSuccess (Success 200) {String} items.site_name
* @apiSuccess (Success 200) {String} items.logo_url
*
* @apiSuccessExample Success-Response:
* HTTP Status: 200
{
"total": 10,
"items": [
  {
    "id": 1,
    "short": "apple",
    "long": "apple.com",
    "site_name": "苹果",
    "logo_url": "xxxx"
  }
]
}
*/
  route.get('/short/list', getList)

  /**
* @api {get} /short/detail 编辑短地址
* @apiVersion 1.0.0
* @apiGroup Short
*
* @apiParam {Number{>=1}} id  id
*
* @apiSuccess (Success 201) {Number} id
* @apiSuccess (Success 201) {String} short
* @apiSuccess (Success 201) {String} long
* @apiSuccess (Success 201) {String} site_name
* @apiSuccess (Success 201) {String} logo_url
*
* @apiSuccessExample Success-Response:
* HTTP Status: 201
{
"id": 1,
"short": "apple",
"long": "apple.com",
"site_name": "苹果",
"logo_url": "xxxx"
}
*
*/
  route.get('/short/detail', getDetail)

  /**
* @api {post} /short/add 新增一条短地址
* @apiVersion 1.0.0
* @apiGroup Short
*
* @apiParam {String} short  短地址
* @apiParam {String} long  长地址
* @apiParam {String} [site_name] 网站名称
* @apiParam {String} [logo_url]  网站图片
*
* @apiSuccess (Success 201) {Number} id
* @apiSuccess (Success 201) {String} short
* @apiSuccess (Success 201) {String} long
* @apiSuccess (Success 201) {String} site_name
* @apiSuccess (Success 201) {String} logo_url
*
* @apiSuccessExample Success-Response:
* HTTP Status: 201
{
   "id": 10,
   "short": "apple",
   "long": "apple.com",
   "site_name": "苹果",
   "logo_url": "xxxx"
}
*
*/
  route.post('/short/add', multer({ storage }).single('logo_url'), addShort)

  /**
* @api {post} /short/update 编辑短地址
* @apiVersion 1.0.0
* @apiGroup Short
*
* @apiParam {String} id  id
* @apiParam {String} short  短地址
* @apiParam {String} long  长地址
* @apiParam {String} [site_name] 网站名称
* @apiParam {String} [logo_url]  网站图片
*
* @apiSuccess (Success 201) {Number} id
* @apiSuccess (Success 201) {String} short
* @apiSuccess (Success 201) {String} long
* @apiSuccess (Success 201) {String} site_name
* @apiSuccess (Success 201) {String} logo_url
*
* @apiSuccessExample Success-Response:
* HTTP Status: 201
{
 "id": 10,
 "short": "apple",
 "long": "apple.com",
 "site_name": "苹果",
 "logo_url": "xxxx"
}
*
*/
  route.post('/short/update', multer({ storage }).single('logo_url'), updateShort)
}
