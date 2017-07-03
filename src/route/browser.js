const User = require('../schema/user')
const Browser = require('../schema/browser')
const path = require('path')
const errors = require('../error')
const { validate, getSchema, T } = require('../validator')

const SCHEMA = {
    id: T.number().integer(),
    platform: T.string().required(),
    client: T.string().required(),
    link: T.string().uri().required(),
    version: T.boolean().default(false),
}

const ERRORS = {
    CreateBrowserFailed: 400,
    NameRequired: 400,
    IconRequired: 400,
    HomeUrlRequired: 400,
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

    const createNewBrowser = async (req, res, next) => {
        try {
            validate(req.body, getSchema(SCHEMA, 'id'))
            const tarId = req.body ? req.body.id : null
            const profile = await User.getProfile(req.user.id, tarId, config)
            // 信息不全的不允许生成浏览器
            if (!profile || !profile.username) throw new errors.UserNotFoundError()
            if (!profile.name) throw new errors.NameRequiredError()
            if (!profile.icon) throw new errors.IconRequiredError()
            if (!profile.homeUrl) throw new errors.HomeUrlRequiredError()
            /* eslint-disable no-underscore-dangle */
            if (global.__TEST__) return res.send(profile)
            const setupFileName = await Browser.createBrowser(config, profile)
            // update version
            // await Browser.updateBrowser(platform, client, link, version)
            return res.json({
                path: `/download/${setupFileName}.exe`,
            })
            // return res.redirect(`/download/${setupFileName}.exe`)
        } catch (err) {
            return next(err)
        }
    }

    const getCreateClientPage = (req, res) => {
        const page = path.join(__dirname, '..', 'public/view/client.html')
        return res.sendFile(page)
    }

    exempt('/browser/version')
    exempt('/browser/new')

    route.get('/browser/version', getVersion)
    route.get('/browser/new', getCreateClientPage)
    route.post('/browser/create', createNewBrowser)
}
