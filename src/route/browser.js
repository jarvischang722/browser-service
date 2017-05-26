const Browser = require('../schema/browser')
const fs = require('fs')
const path = require('path')
const log4js = require('log4js')
const utils = require('../utils')
const uuidV4 = require('uuid/v4')
const multer  = require('multer')
const upload = multer({ dest: 'upload/' })

const logger = log4js.getLogger()

module.exports = (route, config) => {
    const getVersion = (req, res, next) => {
        const { platform, client } = req.query
        const version = Browser.getVersion(platform, client)
        return res.json(version)
    }

    const createNewBrowser = async (req, res, next) => {
        try {
            const { client, homepage, company } = req.body
            if (!client || !homepage || !company)  return res.status(400).send('Missing fields')
            const { projectPath, version, legalCopyright } = config.browser
            const optionPath = path.join(projectPath, `src/clients/${client}`)
            if (!fs.existsSync(optionPath))  fs.mkdirSync(optionPath)
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
                    localAddr: "127.0.0.1",
                    localPort: 21866,
                    serverAddr: "106.75.147.144",
                    serverPort: 19999,
                    password: "0367E21094d36315",
                    method: "aes-256-cfb",
                    timeout: 180
                }
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
            await utils.rceditSync(path.join(projectPath, 'dist/unpacked/safety-browser.exe') , rceditOptions)

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
                signtoolname: 'signtool',
                signtoolcommand: `"${projectPath}\\build\\install-script\\signtool.exe" sign /f "${projectPath}\\build\\install-script\\smartbrowser.pfx" /t http://timestamp.globalsign.com/scripts/timstamp.dll /p "12345678" $f`,
                O: path.join(__dirname, '../..', 'deploy'),
                F: setupFileName,
                DProjectHomeBase: projectPath,
                DCLIENT: options.client,
                DCLIENT_GUID: `{${options.clientId}}`,
                DAPP_NAME: 'SmartBrowserName',
                DAPP_TITLE_EN: options.productNameEn,
                DAPP_TITLE_CH: options.productName,
                DAPP_ICO: icon,
            })
            return res.redirect(`/download/${setupFileName}.exe`)
        } catch (err) {
            logger.error(err)
            return res.status(400).send('请回退并刷新网页重试')
        }
    }

    const getCreateClientPage = (req, res, next) => {
        return res.sendFile(path.join(__dirname, '..', 'public/client.html'));
    }

    route.get('/browser/version', getVersion)
    route.get('/browser/clients/new', getCreateClientPage)
    route.post('/browser/create', upload.single('icon'),  createNewBrowser)
}
