const version = require('../meta/browser.json')

const getVersion = (platform, client) => {
    if (!platform && !client) return version
    let result = {}
    if (platform) {
        if (version.hasOwnProperty(platform)) {
            result = version[platform]
            if (client) {
                if (version[platform].hasOwnProperty(client)) {
                    result = version[platform][client]
                } else {
                    result = {}
                }
            }
        }
    } else {
        // no platform, has client
        for (const pf in version) {
            if (version[pf].hasOwnProperty(client)) {
                result[pf] = version[pf][client]
            }
        }
    }
    return result
}

module.exports = {
    getVersion,
}