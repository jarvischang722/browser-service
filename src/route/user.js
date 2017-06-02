const User = require('../schema/user')
const errors = require('../error')

const ERRORS = {
    UserUnauthorized: 401,
}

errors.register(ERRORS)

module.exports = (route, config) => {
    const signup = async (req, res, next) => {
        try {
            const { username, email, password } = req.body
            if (!username || !email || !password) {
                return res.status(400).send('Username, email and password are required')
            }
            await User.signup(username, email, password, config.secret.token)
            return res.status(201).send()
        } catch (err) {
            return next(err)
        }
    }

    const login = async (req, res, next) => {
        try {
            const { username, password } = req.body
            if (!username || !password) {
                return res.status(400).send('Username and password are required')
            }
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
