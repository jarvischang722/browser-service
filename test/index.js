const mysql = require('mysql')
const config = require('../src/config')
const User = require('../src/schema/user')

global.conn = mysql.createConnection({
    host: 'localhost',
    database: 'test',
    user: 'root',
    password: '1qaz!QAZ',
});
global.config = config

const username = 'aa'
const password = 'bb'
User.authorize(username, password, config.secret.token, (err, player) => {
    console.log(err, player);
    if(!player) return
    User.generateToken(player.id, config.timeout.token, (err, token) => {
        console.log(err);
        console.log({
            status: 'Ok',
            message: 'Login successfully',
            data: {
                token,
                ss: null,
            }
        })
    })
})