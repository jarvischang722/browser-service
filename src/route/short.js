const Short = require('../schema/short')
const { validate, getSchema, T } = require('../validator')

const SCHEMA = {
  q: T.string(),
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

  exempt('/browser/short')

  route.get('/browser/short', getLong)
}
