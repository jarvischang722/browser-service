const multer = require('multer')
const User = require('../schema/user')
const errors = require('../error')
const { validate, getSchema, T } = require('../validator')
const { generateToken } = require('../authorization')

const upload = multer({ dest: 'upload/' })

const SCHEMA = {
    id: T.number().integer(),
    role: T.number().integer().valid(1, 2),
    name: T.string().required(),
    icon: T.string().required(),
    expireIn: T.number().required(),
    username: T.string().required(),
    password: T.string().required(),
    homeUrl: T.alternatives().try(
        T.array().items(T.string().uri()),
        T.string().uri()
    ).required(),
}

const ERRORS = {
    NoPermission: 400,
    UserNotFound: 404,
    CreateUserFailed: 400,
    UserDuplicated: 400,
    InvalidExpireIn: 400,
    UserExpired: 400,
    IconNotExists: 400,
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

    const uploadIcon = async (req, res, next) => {
        try {
            const icon = await User.uploadIcon(req)
            return res.json(icon)
        } catch (err) {
            return next(err)
        }
    }

    const updateProfile = async (req, res, next) => {
        try {
            validate(req.body, getSchema(SCHEMA, 'id', 'name', 'homeUrl', 'icon'))
            const user = await User.updateProfile(req.user.id, req)
            return res.json(user)
        } catch (err) {
            return next(err)
        }
    }

    const createUser = async (req, res, next) => {
        try {
            if (!req.user || req.user.role !== 1) throw new errors.NoPermissionError()
            validate(req.body, getSchema(SCHEMA, 'username', 'password', 'role', 'name', 'expireIn'))
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
            const users = await User.getChildren(req.user.id)
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

    exempt('/user/login')

    route.post('/user/login', login)
    route.get('/user/profile', getProfile)
    route.post('/user/icon', upload.single('icon'), uploadIcon)
    route.post('/user/profile', updateProfile)
    route.post('/user/create', createUser)
    route.get('/user/list', getChildren)
    route.post('/user/expire', changeChildExpireTime)
}
