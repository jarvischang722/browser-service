const Browser = require('../schema/browser')

module.exports = (route, config) => {
    const getVersion = (req, res, next) => {
        const { platform, client } = req.query
        const version = Browser.getVersion(platform, client)
        return res.json(version)
    }

    route.post('/browser/version', getVersion)
}
