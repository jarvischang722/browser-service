const User = require('../schema/user')
const errors = require('../error')
const { validate, getSchema, T } = require('../validator')
const { generateToken } = require('../authorization')

const SCHEMA = {
    username: T.string().required(),
    password: T.string().required(),
}

module.exports = (route, config, exempt) => {
    const signup = async (req, res, next) => {
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

    // exempt('/user/signup')
    exempt('/user/login')

    // route.post('/user/signup', signup)
    route.post('/user/login', login)
}
