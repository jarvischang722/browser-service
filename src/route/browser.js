const Browser = require('../schema/browser')
const path = require('path')
const log4js = require('log4js')
const multer = require('multer')
const errors = require('../error')
const browserUtils = require('../utils/browser')
const { validate, getSchema, T } = require('../validator')

const upload = multer({ dest: 'upload/' })
const logger = log4js.getLogger()

const SCHEMA = {
    platform: T.string().required(),
    client: T.string().required(),
    link: T.string().uri().required(),
    version: T.boolean().default(false),
    homepage: T.string().required(),
    company: T.string().required(),
    useProxy: T.string().valid('on'),
}

const ERRORS = {
    CreateBrowserFailed: 400,
}

errors.register(ERRORS)

module.exports = (route, config, exempt) => {
    const getVersion = async (req, res, next) => {
        try {
            validate(req.query, getSchema(SCHEMA, 'platform', 'client'))
            const { platform, client } = req.query
            const version = await Browser.getVersion(platform, client)
            return res.json(version)
        } catch (err) {
            return next(err)
        }
    }

    const updateBrowser = async (req, res, next) => {
        try {
            validate(req.body, getSchema(SCHEMA, 'platform', 'client', 'link', 'version'))
            const { platform, client, link, version } = req.body
            await Browser.updateBrowser(platform, client, link, version)
            return res.status(204).send()
        } catch (err) {
            return next(err)
        }
    }

    const createNewBrowser = async (req, res, next) => {
        try {
            validate(req.body, getSchema(SCHEMA, 'client', 'homepage', 'company', 'useProxy'), ['client'])
            /* eslint-disable no-underscore-dangle */
            if (global.__TEST__) return res.send(req.body)
            const setupFileName = await browserUtils.createBrowser(config, req)
            return res.redirect(`/download/${setupFileName}.exe`)
        } catch (err) {
            if (!global.__TEST__) logger.error(err)
            if (err && err.code === 'ValidationFailed') return next(err)
            return next(new errors.CreateBrowserFailedError())
        }
    }

    const getCreateClientPage = (req, res) => {
        const page = path.join(__dirname, '..', 'public/view/client.html')
        return res.sendFile(page)
    }

    exempt('/browser/version')
    exempt('/browser/new')
    exempt('/browser/create')

    route.get('/browser/version', getVersion)
    route.post('/browser/version', updateBrowser)
    route.get('/browser/new', getCreateClientPage)
    route.post('/browser/create', upload.single('icon'), createNewBrowser)
}
