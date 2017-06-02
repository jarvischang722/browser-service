const User = require('../schema/user')

module.exports = (route, config) => {
    const signup = async (req, res) => {
        const { username, email, password } = req.body
        if (!username || !email || !password) {
            return res.status(400).send('Username, email and password are required')
        }
        await User.signup(username, email, password, config.secret.token)
        return res.status(201).send()
    }

    const login = async (req, res) => {
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).send('Username and password are required')
        }
        const player = await User.authorize(username, password, config.secret.token)
        if (!player) return res.status(401).send('Unauthorized')
        const token = await User.generateToken(player.id, config.timeout.token)
        return res.json({
            token,
            ssinfo: null,
        })
    }

    const test = async (req, res) => {
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).send('Username and password are required')
        }
        if (username && username.toLowerCase() === 'admin' && password === 'pass1234') {
            return res.json({
                status: 'Ok',
                message: 'Login successfully',
                data: {
                    token: 'testtoken',
                    ss: null,
                },
            })
        }
        return res.status(401).send('Unauthorized')
    }

    const testUser = async (req, res) => {
        const user = {
            user: 'test',
        }
        return res.json(user)
    }

    route.post('/user/signup', signup)
    route.post('/user/login', login)
    route.post('/user/test', test)
    route.get('/user/test', testUser)
}
