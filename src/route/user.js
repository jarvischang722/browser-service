const User = require('../schema/user')

module.exports = (route, config) => {
    const signup = (req, res, next) => {
        const { username, email, password } = req.body
        if ((!username && !email) || !password) {
            return res.status(400).send('Username and password are required')
        }
        User.signup(username, email, password, config.secret.token, (err, player) => {
            if (err) return res.status(400).send('Login failed')
            if (!player) return res.status(401).send('Unauthorized')
            return res.json(player)
        })
    }

    const login = (req, res, next) => {
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).send('Username and password are required')
        }
        User.authorize(username, password, config.secret.token, (err, player) => {
            if (err) return res.status(400).send('Login failed')
            if (!player) return res.status(401).send('Unauthorized')
            User.generateToken(player.id, config.timeout.token, (err, token) => {
                if (err) return res.status(400).send('Login failed')
                return res.json({
                    status: 'Ok',
                    message: 'Login successfully',
                    data: {
                        token,
                        ss: null,
                    }
                })
            })
        })
    }

    const test = (req, res, next) => {
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).send('Username and password are required')
        }
        if (username && username.toLowerCase() === 'admin' && password === 'pass') {
            return res.json({
                status: 'Ok',
                message: 'Login successfully',
                data: {
                    token: 'testtoken',
                    ss: null,
                }
            })
        }
        return res.status(401).send('Unauthorized')
    }
    
    route.post('/user/signup', signup)
    route.post('/user/login', login)
    route.post('/user/test', test)
}
