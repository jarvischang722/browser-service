const request = require('supertest')

module.exports = () => {
    const client = request(global.server)
    return client
}
