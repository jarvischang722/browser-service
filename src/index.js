const express = require('express')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const log4js = require('log4js')
const config = require('./config')

const app = express()
const log = log4js.getLogger()

app.use(helmet())
app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.send('Tripleonetech discover service')
})

app.post('/login', (req, res, next) => {
    console.log(req.body);
    const { username, password } = req.body
    if (!username || !password) {
        return res.status(400).send('Username and password are required')
    }
    if (username.toLowerCase() === 'admin' && password === 'pass') {
        return res.json({
            status: 'Ok',
            message: 'Login successfully',
            data: {
                token: '',
                ss: null,
            }
        })
    } else {
        return res.status(401).send('unauthorized')
    }
})

const port = config.server.port
app.listen(port, () => {
    log.info(`The server [${config.name}] running on port: ${port}`)
})