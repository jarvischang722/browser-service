const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const log4js = require('log4js')
const config = require('./config')
const route = require('./route')
const errors = require('./error')
const authorization = require('./authorization')
const cors = require('cors')

global.db = require('./db')

const log = log4js.getLogger()
const server = async () => {
  // update db to latest
  // db connection
  const dbManager = db.configure(config)
  await dbManager.update()
  log.info(`db version: ${dbManager.version}`)

  const app = express()

  app.use(helmet())

  app.use(
    cors({
      origin: (origin, callback) => {
        callback(null, true)
      },
      allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, X-Auth-Key, If-None-Match',
      credentials: true
    })
  )

  app.use('/download', express.static('deploy'))
  app.use('/upload', express.static('upload'))
  app.use('/pub_plugins', express.static('pub_plugins'))

  const apiRouter = new express.Router()
  apiRouter.use(cookieParser(config.secret.cookie))

  apiRouter.use(bodyParser.urlencoded({ extended: false }))
  apiRouter.use(bodyParser.json())
  apiRouter.use(authorization.authorize(config))

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

  app.use((req, res) => {
    res.redirect('/smart/')
  })

  const port = config.server.port

  /* eslint-disable no-underscore-dangle */
  if (global.__TEST__) return app
  return app.listen(port, () => {
    log.info(`The server [${config.name}] running on port: ${port}`)
  })
}

module.exports = () => {
  const handleErr = e => {
    log.error(e)
    throw e
  }
  return server().catch(handleErr)
}
