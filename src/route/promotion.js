const Promotion = require('../schema/promotion')
const { validate, getSchema, T } = require('../validator')
const errors = require('../error')

const SCHEMA = {
  agentSortList: T.array()
    .required()
    .items(T.object())
}

const ERRORS = {}

errors.register(ERRORS)

module.exports = (route, config, exempt) => {
  const list = async (req, res, next) => {
    try {
      if (!req.user || req.user.role !== 1) throw new errors.NoPermissionError()
      const agentList = await Promotion.list(req.user.id)
      res.json({ items: agentList })
    } catch (err) {
      next(err)
    }
  }

  const updateSort = async (req, res, next) => {
    try {
      validate(req.body, getSchema(SCHEMA, 'agentSortList'))
      const isUpdated = await Promotion.updateSort(req.body.agentSortList)
      res.json({ isUpdated })
    } catch (err) {
      next(err)
    }
  }

  route.get('/promotion/list', list)
  route.post('/promotion/updateSort', updateSort)
}
