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
  blackList: T.string(),
  whiteList: T.string()
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


  route.get('/blackWhite/list', getList)
  route.get('/blackWhite/detail', getDetail)
  route.post('/blackWhite/update', update)
}
