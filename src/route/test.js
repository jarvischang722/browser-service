const Test = require('../schema/test')

module.exports = (route, config, exempt) => {
    const login = async (req, res, next) => {
        try {
            const player = {
                id: 1,
                token: 'playercentertoken',
            }
            return res.json(player)
        } catch (err) {
            return next(err)
        }
    }

    const testUser = async (req, res) => {
        const user = {
            user: 'test',
        }
        await Test.testTrans()
        return res.json(user)
    }


    exempt('/test/login')

    route.post('/test/login', login)
    route.get('/test/user', testUser)
}
