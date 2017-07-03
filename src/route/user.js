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
    expireIn: T.number().required(),
    username: T.string().required(),
    password: T.string().required(),
    homeUrl: T.alternatives().try(
        T.array().items(T.string().uri()),
        T.string().uri()
    ).required(),
}

const ERRORS = {
    UserNotFound: 404,
    CreateUserFailed: 400,
    UserDuplicated: 400,
    InvalidExpireIn: 400,
}

errors.register(ERRORS)

module.exports = (route, config, exempt) => {
    const createUser = async (req, res, next) => {
        try {
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

    const login = async (req, res, next) => {
        try {
            validate(req.body, getSchema(SCHEMA, 'username', 'password'))
            const { username, password } = req.body
            const user = await User.login(username, password, config)
            if (!user) return next(new errors.UnauthorizedError())
            user.token = generateToken(config, user.id)
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
            validate(req.body, getSchema(SCHEMA, 'id', 'name', 'homeUrl'))
            await User.updateProfile(req.user.id, req, config)
            return res.status(204).send()
        } catch (err) {
            return next(err)
        }
    }

    const getChildren = async (req, res, next) => {
        try {
            const users = await User.getChildren(req.user.id)
            return res.json(users)
        } catch (err) {
            return next(err)
        }
    }

    exempt('/user/login')

    route.post('/user/login', login)
    route.post('/user/create', createUser)
    route.get('/user/profile', getProfile)
    route.post('/user/profile', upload.single('icon'), updateProfile)
    route.get('/user/list', getChildren)
}
