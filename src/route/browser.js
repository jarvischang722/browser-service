const Browser = require('../schema/browser')
const fs = require('fs')
const path = require('path')
const log4js = require('log4js')
const utils = require('../utils')
const uuidV4 = require('uuid/v4')
const multer = require('multer')
const errors = require('../error')
const { validate, getSchema, T } = require('../validator')

const upload = multer({ dest: 'upload/' })
const logger = log4js.getLogger()

const SCHEMA = {
    platform: T.string(),
    client: T.string(),
    homepage: T.string().uri().required(),
    company: T.string().required(),
}

const ERRORS = {
    CreateBrowserFailed: 400,
}

errors.register(ERRORS)

module.exports = (route, config) => {
    const getVersion = (req, res, next) => {
        try {
            validate(req.query, getSchema(SCHEMA, 'platform', 'client'))
            const { platform, client } = req.query
            const version = Browser.getVersion(platform, client)
            return res.json(version)
        } catch (err) {
            return next(err)
        }
    }

    const createNewBrowser = async (req, res, next) => {
        try {
            validate(req.body, getSchema(SCHEMA, 'client', 'homepage', 'company'), ['client'])
            /* eslint-disable no-underscore-dangle */
            if (global.__TEST__) return res.send(req.body)
            const { client, homepage, company } = req.body
            const { projectPath, version, legalCopyright } = config.browser
            const optionPath = path.join(projectPath, `src/clients/${client}`)
            if (!fs.existsSync(optionPath)) fs.mkdirSync(optionPath)
            if (req.file && req.file.path) {
                utils.copy(req.file.path, path.join(optionPath, 'icon.ico'))
            }
            // generate options
            const options = {
                client,
                homeUrl: homepage,
                companyName: company,
                productName: `${company}安全浏览器`,
                productNameEn: `${client.toUpperCase()} Safety Browser`,
                fileDescription: `${company}安全浏览器`,
                legalCopyright,
                version,
                enabledFlash: true,
                enabledProxy: false,
                clientId: uuidV4().toUpperCase(),
                proxyOptions: {
                    localAddr: '127.0.0.1',
                    localPort: 21866,
                    serverAddr: '106.75.147.144',
                    serverPort: 19999,
                    password: '0367E21094d36315',
                    method: 'aes-256-cfb',
                    timeout: 180,
                },
            }
            // generate option file
            const optionFile = path.join(optionPath, 'client.json')
            fs.writeFileSync(optionFile, JSON.stringify(options))
            const icon = path.join(optionPath, 'icon.ico')
            const rceditOptions = {
                'version-string': {
                    CompanyName: options.companyName,
                    FileDescription: options.fileDescription,
                    LegalCopyright: options.legalCopyright || 'Copyright 2017',
                    ProductName: options.productName,
                },
                'file-version': options.version,
                'product-version': options.version,
                icon,
            }
            await utils.copy(path.join(projectPath, 'dist/unpacked/electron.exe'), path.join(projectPath, 'dist/unpacked/safety-browser.exe'), { clobber: false })
            await utils.rceditSync(path.join(projectPath, 'dist/unpacked/safety-browser.exe'), rceditOptions)

            if (fs.existsSync(path.join(optionPath, 'default.pac'))) {
                await utils.copy(path.join(optionPath, 'default.pac'), path.join(projectPath, 'src/app/config/default.pac'))
            }

            await utils.copy(optionFile, path.join(projectPath, 'src/app/config/client.json'))
            await utils.copy(icon, path.join(projectPath, 'src/app/config/icon.ico'))
            await utils.copy(path.join(projectPath, 'src/plugins'), path.join(projectPath, 'dist/unpacked/plugins'))

            await utils.asarSync(path.join(projectPath, 'src/app'), path.join(projectPath, 'dist/unpacked/resources/app.asar'))
            const setupFileName = `safety-browser-${options.client}-setup-${options.version}`
            await utils.compiler(path.join(projectPath, 'build/install-script/smartbrowser.iss'), {
                gui: false,
                verbose: true,
                signtool: 'tripleonesign=$p',
                O: path.join(__dirname, '../..', 'deploy'),
                F: setupFileName,
                DProjectHomeBase: projectPath,
                DCLIENT: options.client,
                DCLIENT_GUID: `{${options.clientId}}`,
                DAPP_VERSION: options.version,
                DAPP_TITLE_EN: options.productNameEn,
                DAPP_TITLE_CH: options.productName,
                DAPP_ICO: icon,
            })
            return res.redirect(`/download/${setupFileName}.exe`)
        } catch (err) {
            if (!global.__TEST__) logger.error(err)
            if (err && err.code === 'ValidationFailed') return next(err)
            return next(new errors.CreateBrowserFailedError())
        }
    }

    const getCreateClientPage = (req, res) => {
        const page = path.join(__dirname, '..', 'public/client.html')
        return res.sendFile(page)
    }

    route.get('/browser/version', getVersion)
    route.get('/browser/new', getCreateClientPage)
    route.post('/browser/create', upload.single('icon'), createNewBrowser)
}
