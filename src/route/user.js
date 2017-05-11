const User = require('../schema/user')

module.exports = (route, config) => {
    const login = (req, res, next) => {
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).send('Username and password are required')
        }
        User.authorize(username, password, config.secret.token, (err, player) => {
            if (err) return res.status(400).send('Login failed')
            if (!player) return res.status(401).send('unauthorized')
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
        res.send('Test service')
    }
    
    route.post('/login', login)
    route.get('/test', test)
}
