const request = require('request-promise-native')
const User = require('../schema/user')
const errors = require('../error')
const { validate, getSchema, T } = require('../validator')
const { generateToken } = require('../authorization')

const SCHEMA = {
    username: T.string().required(),
    email: T.string().email().required(),
    password: T.string().required(),
    client: T.string().required(),
}

const ERRORS = {
    UserUnauthorized: 401,
}

errors.register(ERRORS)

module.exports = (route, config, exempt) => {
    const signup = async (req, res, next) => {
        try {
            validate(req.body, getSchema(SCHEMA, 'username', 'password', 'email'))
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

    const ssoLogin = async (req, res, next) => {
        try {
            return res.json({
            })
        } catch (err) {
            return next(err)
        }
    }

    const centerLogin = async (req, res, next) => {
        try {
            validate(req.body, getSchema(SCHEMA, 'username', 'password', 'client'))
            const { username, password, client } = req.body
            // call API to login and get token back
            // const user = await request({
            //     method: 'POST',
            //     url: 'http://playercenterapi/login',
            //     json: { username, password, client },
            // })
            // fake for now
            const user = {
                id: Math.ceil(Math.random() * 5),
            }
            if (!user) return next(new errors.UserUnauthorizedError())
            const bindedPlayer = await User.getBindedPlayer(client, user.id)
            return res.json(bindedPlayer)
        } catch (err) {
            return next(err)
        }
    }

    exempt('/user/signup')
    exempt('/user/login')
    exempt('/user/login/sso')
    exempt('/user/login/third')

    route.post('/user/signup', signup)
    route.post('/user/login', login)
    route.post('/user/login/sso', ssoLogin) // wechat, qq, facebook...
    route.post('/user/login/third', centerLogin) // mgm, agtop...
}
