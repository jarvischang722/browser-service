const version = require('../meta/browser.json')

const getVersion = (platform, client) => {
    if (!platform && !client) return version
    let result = {}
    if (platform) {
        if (version[platform]) {
            result = version[platform]
            if (client) {
                if (version[platform][client]) {
                    result = version[platform][client]
                } else {
                    result = {}
                }
            }
        }
    } else {
        // no platform, has client
        /* eslint-disable no-restricted-syntax */
        for (const pf of Object.keys(version)) {
            if (version[pf][client]) {
                result[pf] = version[pf][client]
            }
        }
    }
    return result
}

module.exports = {
    getVersion,
}
