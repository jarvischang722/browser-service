const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const log4js = require('log4js')
const mysql = require('mysql')
const config = require('./config')
const route = require('./route')

const app = express()
const log = log4js.getLogger()

app.use(helmet())

// db connection
const dbCfg = config.database.mysql
global.conn = mysql.createConnection({
    host: dbCfg.host,
    port: dbCfg.port,
    database: dbCfg.db,
    user: dbCfg.credentials.username,
    password: dbCfg.credentials.password,
});

const apiRouter = new express.Router()
apiRouter.use(cookieParser(config.secret.cookie))
apiRouter.use(bodyParser.json())
  
route.bind(apiRouter, config)
app.use('/', apiRouter)

const port = config.server.port
app.listen(port, () => {
    log.info(`The server [${config.name}] running on port: ${port}`)
})