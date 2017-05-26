const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const log4js = require('log4js')
const config = require('./config')
const route = require('./route')

const app = express()
const log = log4js.getLogger()

app.use(helmet())
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

// db connection
const dbCfg = config.database.mysql
global.connStr = {
    host: dbCfg.host,
    port: dbCfg.port,
    database: dbCfg.db,
    user: dbCfg.credentials.username,
    password: dbCfg.credentials.password,
}

const apiRouter = new express.Router()
apiRouter.use(cookieParser(config.secret.cookie))

apiRouter.use(bodyParser.urlencoded({ extended: false }))
apiRouter.use(bodyParser.json())
  
route.bind(apiRouter, config)
app.use('/', apiRouter)

const port = config.server.port
app.listen(port, () => {
    log.info(`The server [${config.name}] running on port: ${port}`)
})