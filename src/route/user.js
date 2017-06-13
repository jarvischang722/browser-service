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
            let player = await request({
                method: 'POST',
                url: 'http://localhost:7002/test/login',
                json: { username, password, client },
            })
            let playerBinded = false
            if (player) {
                // check binding
            } else {
                // invoke game center API to create new player and get info back
                player = await request({
                    method: 'POST',
                    url: 'http://localhost:7002/test/new',
                    json: { username, password, client },
                })
            }
            // check binding
            if (!playerBinded) {
                // bind player
            }
            return res.json({
            })
        } catch (err) {
            return next(err)
        }
    }

    exempt('/user/signup')
    exempt('/user/login')

    route.post('/user/signup', signup)
    route.post('/user/login', login)
    route.post('/user/ssoLogin', ssoLogin) // wechat, qq, facebook...
    route.post('/user/centerLogin', centerLogin) // mgm, agtop...
}
