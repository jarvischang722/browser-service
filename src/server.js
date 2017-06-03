const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const log4js = require('log4js')
const config = require('./config')
const route = require('./route')
const errors = require('./error')

const log = log4js.getLogger()
const server = async () => {
    const app = express()

    app.use(helmet())
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
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

    /* eslint-disable no-unused-vars */
    apiRouter.use((err, req, res, next) => {
        let error = {}
        let statusCode = 500
        if (typeof err === 'string') {
            const e = new errors.InternalError()
            error.code = e.name
            error.message = `${errors.lang(e)} (${err})` || e.name
        } else if (err.failedValidation) {
            statusCode = 400
            error = err
        } else if (err.name) {
            error.code = err.name
            error.message = errors.lang(err) || err.name
            statusCode = err.statusCode || statusCode
        } else {
            error.code = err.code
            error.message = err.message
            statusCode = err.statusCode || statusCode
        }
        res.status(statusCode).send({ error })
    })

    app.use('/', apiRouter)

    app.use('/styles', express.static('src/public/css'))
    app.use('/download', express.static('deploy'))

    const port = config.server.port

    /* eslint-disable no-underscore-dangle */
    if (global.__TEST__) return app
    return app.listen(port, () => {
        log.info(`The server [${config.name}] running on port: ${port}`)
    })
}

module.exports = () => {
    const handleErr = (e) => {
        log.error(e)
        throw e
    }
    return server().catch(handleErr)
}