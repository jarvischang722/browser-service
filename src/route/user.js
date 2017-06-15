const request = require('request-promise-native')
const User = require('../schema/user')
const errors = require('../error')
const { validate, getSchema, T } = require('../validator')
const { generateToken } = require('../authorization')

const SCHEMA = {
    username: T.string().required(),
    email: T.string().email().required(),
    password: T.string().required(),
    merchant: T.string().required(),
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
            const user = await User.login(username, password, config.secret.token)
            if (!user) return next(new errors.UnauthorizedError())
            user.token = generateToken(config, user.id)
            return res.json({
                user,
                ssinfo: null,
            })
        } catch (err) {
            return next(err)
        }
    }

    // 使用我们自己系统的账号登陆第三方游戏
    const ssoLogin = async (req, res, next) => {
        try {
            // login and get binded user
            validate(req.body, getSchema(SCHEMA, 'username', 'password', 'merchant'))
            const { username, password, merchant } = req.body
            const user = await User.login(username, password, config.secret.token)
            if (!user) return next(new errors.UnauthorizedError())
            let player = await User.getBindedPlayer(merchant, user.id)
            if (!player) {
                // TODO: call API to generate new merchant player
                // player = await request({
                //     method: 'POST',
                //     url: 'http://playercenterapi/signup',
                //     json: { username, password, merchant },
                // })
                // fake for now
                player = {
                    id: Math.ceil(Math.random() * 5),
                }
                await User.bindPlayer(merchant, user.id, player.id)
            }
            return res.json(user)
        } catch (err) {
            return next(err)
        }
    }

    // 使用第三方游戏账号登陆我们的系统
    const merchantLogin = async (req, res, next) => {
        try {
            validate(req.body, getSchema(SCHEMA, 'username', 'password', 'merchant'))
            const { username, password, merchant } = req.body
            // TODO: call API to login and get token back
            // const user = await request({
            //     method: 'POST',
            //     url: 'http://playercenterapi/login',
            //     json: { username, password, merchant },
            // })
            // fake for now
            const player = {
                id: Math.ceil(Math.random() * 5),
            }
            if (!player) return next(new errors.UnauthorizedError())
            const user = await User.getBindedUser(merchant, player.id)
            return res.json(user)
        } catch (err) {
            return next(err)
        }
    }

    exempt('/user/signup')
    exempt('/user/login')
    exempt('/user/login/sso')
    exempt('/user/login/merchant')

    route.post('/user/signup', signup)
    route.post('/user/login', login)
    route.post('/user/login/sso', ssoLogin) // wechat, qq, facebook...
    route.post('/user/login/merchant', merchantLogin) // mgm, agtop...
}
