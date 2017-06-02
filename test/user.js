const config = require('../src/config')
const User = require('../src/schema/user')

global.connStr = {
    host: 'localhost',
    database: 'test',
    user: 'root',
    password: '1qaz!QAZ',
}
global.config = config

const username = 'test7777'
const password = 'test7777'

User.signup(`testuser_${Date.now()}`, 'email.com', 'test1234', config.secret.token)

// User.authorize(username, password, config.secret.token, (err, player) => {
//     if(!player) return
//     User.generateToken(player.id, config.timeout.token, (err, token) => {
//         console.log({
//             status: 'Ok',
//             message: 'Login successfully',
//             data: {
//                 token,
//                 ss: null,
//             }
//         })
//     })
// })