const User = require('../schema/user')
const errors = require('../error')
const { validate, getSchema, T } = require('../validator')
const { generateToken } = require('../authorization')

const SCHEMA = {
    id: T.number().integer(),
    username: T.string().required(),
    password: T.string().required(),
}

const ERRORS = {
    UserNotFound: 404,
}

errors.register(ERRORS)

module.exports = (route, config, exempt) => {
    const createNewUser = async (req, res, next) => {
        try {
            validate(req.body, getSchema(SCHEMA, 'username', 'password', 'email'))
            const { username, email, password } = req.body
            const user = await User.signup(username, email, password, config.secret.token)
            user.token = generateToken(config, user.id)
            return res.status(201).send(user)
        } catch (err) {
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
            validate(req.body, getSchema(SCHEMA, 'id'))
            const user = await User.getProfile(req.user.id, req.query.id, config)
            if (!user) return next(new errors.UserNotFoundError())
            return res.json(user)
        } catch (err) {
            return next(err)
        }
    }

    exempt('/user/login')

    route.post('/user/login', login)
    route.post('/user/new', createNewUser)
    route.get('/user/profile', getProfile)
}
