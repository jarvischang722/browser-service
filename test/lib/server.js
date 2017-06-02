const server = require('../../src/server')
const options = require('../../src/config')

global.__DEV__ = true
global.__TEST__ = true

let app = null

module.exports = async () => {
    if (app === null) {
        app = await server()
    }
    return app
}