const multer = require('multer')
const User = require('../schema/user')
const errors = require('../error')
const { validate, getSchema, T } = require('../validator')
const { generateToken } = require('../authorization')

const SCHEMA = {
  id: T.number().integer(),
  role: T.number().integer().valid(1, 2).default(1),
  name: T.string(),
  expireIn: T.date().timestamp('unix').raw().allow(null, ''),
  username: T.string().required(),
  password: T.string().required(),
  homeUrl: T.alternatives().try(
    T.array().items(T.string().uri()),
    T.string().uri()
  ).required(),
  icon: T.string(),
  page: T.number().integer().min(1).default(1),
  pagesize: T.number().integer().min(1).default(10),
}

const ERRORS = {
  NoPermission: 403,
  UserNotFound: 404,
  CreateUserFailed: 400,
  UserDuplicated: 400,
  ExpireInRequired: 400,
  InvalidExpireIn: 400,
  UserExpired: 400,
}

errors.register(ERRORS)

module.exports = (route, config, exempt) => {
  const login = async (req, res, next) => {
    try {
      validate(req.body, getSchema(SCHEMA, 'username', 'password'))
      const { username, password } = req.body
      const user = await User.login(username, password, config)
      if (!user) return next(new errors.UnauthorizedError())
      user.token = generateToken(config, user.id, user.role)
      return res.json(user)
    } catch (err) {
      return next(err)
    }
  }

  const recurrent = async (req, res, next) => {
    try {
      const user = await User.getUser(req.user.id)
      if (!user) return next(new errors.UnauthorizedError())
      user.token = generateToken(config, user.id, user.role)
      return res.json(user)
    } catch (err) {
      return next(err)
    }
  }

  const getProfile = async (req, res, next) => {
    try {
      validate(req.query, getSchema(SCHEMA, 'id'))
      const user = await User.getProfile(req.user.id, req.query.id, config)
      if (!user) return next(new errors.UserNotFoundError())
      return res.json(user)
    } catch (err) {
      return next(err)
    }
  }

  const updateProfile = async (req, res, next) => {
    try {
      validate(req.body, getSchema(SCHEMA, 'id', 'name', 'homeUrl', 'icon'), ['name'])
      const user = await User.updateProfile(req.user.id, req)
      return res.json(user)
    } catch (err) {
      return next(err)
    }
  }

  const createUser = async (req, res, next) => {
    try {
      if (!req.user || req.user.role !== 1) throw new errors.NoPermissionError()
      validate(req.body, getSchema(SCHEMA, 'username', 'role', 'name', 'expireIn'))
      const user = await User.createUser(req.user.id, req.body)
      return res.status(201).send(user)
    } catch (err) {
      if (err && err.message.includes('ER_DUP_ENTRY')) {
        return next(new errors.UserDuplicatedError())
      }
      return next(err)
    }
  }

  const getChildren = async (req, res, next) => {
    try {
      if (!req.user || req.user.role !== 1) throw new errors.NoPermissionError()
      const v = validate(req.query, getSchema(SCHEMA, 'page', 'pagesize'))
      const { page, pagesize } = v
      const users = await User.getChildren(req.user.id, page, pagesize)
      return res.json(users)
    } catch (err) {
      return next(err)
    }
  }

  const changeChildExpireTime = async (req, res, next) => {
    try {
      if (!req.user || req.user.role !== 1) throw new errors.NoPermissionError()
      validate(req.body, getSchema(SCHEMA, 'id', 'expireIn'))
      const { id, expireIn } = req.body
      const user = await User.changeChildExpireTime(req.user.id, id, expireIn)
      return res.json(user)
    } catch (err) {
      return next(err)
    }
  }

  const storage = multer.diskStorage({
    destination: 'upload/icon',
    filename: (req, file, cb) => {
      const tarId = req.body.id || req.user.id
      cb(null, `${tarId}.ico`)
    }
  })

  exempt('/user/login')

  route.post('/user/login', login)
  route.get('/user/recurrent', recurrent)
  route.get('/user/profile', getProfile)
  route.post('/user/profile', multer({ storage }).single('icon'), updateProfile)
  route.post('/user/create', createUser)
  route.get('/user/list', getChildren)
  route.post('/user/expire', changeChildExpireTime)
}
