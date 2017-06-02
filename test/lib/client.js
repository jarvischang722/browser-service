const request = require('supertest')

module.exports = () => {
    return request(global.server)
}
