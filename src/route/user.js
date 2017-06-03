const User = require('../schema/user')
const errors = require('../error')
const { validate, getSchema, T } = require('../validator')
const { generateToken } = require('../authorization')

const SCHEMA = {
    username: T.string().required(),
    email: T.string().email().required(),
    password: T.string().required(),
}

const ERRORS = {
    UserUnauthorized: 401,
}

errors.register(ERRORS)

module.exports = (route, config, exempt) => {
    const signup = async (req, res, next) => {
        try {
            validate(req.body, SCHEMA)
            const { username, email, password } = req.body
            const player = await User.signup(username, email, password, config.secret.token)
            player.token = generateToken(config, player.id)
            return res.status(201).send(player)
        } catch (err) {
            return next(err)
        }
    }

    const login = async (req, res, next) => {
        try {
            validate(req.body, getSchema(SCHEMA, 'username', 'password'))
            const { username, password } = req.body
            const player = await User.login(username, password, config.secret.token)
            if (!player) return next(new errors.UserUnauthorizedError())
            // const token = await User.generateToken(player.id, config.timeout.token)
            player.token = generateToken(config, player.id)
            return res.json({
                player,
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

    exempt('/user/signup')
    exempt('/user/login')

    route.post('/user/signup', signup)
    route.post('/user/login', login)
    route.get('/user/test', test)
}
