const User = require('../schema/user')
const errors = require('../error')
const { validate, getSchema, T } = require('../validator')

const SCHEMA = {
    username: T.string().required(),
    email: T.string().email().required(),
    password: T.string().required(),
}

const ERRORS = {
    UserUnauthorized: 401,
}

errors.register(ERRORS)

module.exports = (route, config) => {
    const signup = async (req, res, next) => {
        try {
            validate(req.body, SCHEMA)
            const { username, email, password } = req.body
            await User.signup(username, email, password, config.secret.token)
            return res.status(201).send()
        } catch (err) {
            return next(err)
        }
    }

    const login = async (req, res, next) => {
        try {
            validate(req.body, getSchema(SCHEMA, 'username', 'password'))
            const { username, password } = req.body
            const player = await User.authorize(username, password, config.secret.token)
            if (!player) return next(new errors.UserUnauthorizedError())
            const token = await User.generateToken(player.id, config.timeout.token)
            return res.json({
                token,
                ssinfo: null,
            })
        } catch (err) {
            return next(err)
        }
    }

    const test = async (req, res) => {
        const user = {
            user: 'test',
        }
        return res.json(user)
    }

    route.post('/user/signup', signup)
    route.post('/user/login', login)
    route.get('/user/test', test)
}
