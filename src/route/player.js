const errors = require('../error')
const Player = require('../schema/player')
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
  playerId: T.number().integer(),
  status: T.string().required(),
  disableExpire: T.date()
}


const ERRORS = {
  PlayerNotFound: 404,
}

errors.register(ERRORS)

module.exports = (route, config, exempt) => {
  const getList = async (req, res, next) => {
    try {
      //   const { page, pagesize } = validate(req.query, getSchema(SCHEMA, 'page', 'pagesize'))
      const { page, pagesize } = validate(req.query, getSchema(SCHEMA, 'page', 'pagesize'))
      const list = await Player.getList(page, pagesize)
      return res.json(list)
    } catch (err) {
      return next(err)
    }
  }
  const getDetail = async (req, res, next) => {
    try {
      const { playerId } = validate(req.query, getSchema(SCHEMA, 'playerId'))
      const player = await Player.getDetail(playerId)
      return res.json(player)
    } catch (err) {
      return next(err)
    }
  }

  const updateSta = async (req, res, next) => {
    try {
      validate(req.body, getSchema(
        SCHEMA, 'playerId', 'status', 'disableExpire')
      )
      const result = await Player.updatePlayerSta(req)
      return res.json(result)
    } catch (err) {
      return next(err)
    }
  }


  route.get('/player/list', getList)
  route.get('/player/detail', getDetail)
  route.post('/player/updateSta', updateSta)
}
