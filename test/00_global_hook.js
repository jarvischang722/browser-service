const chai = require('chai')
const charAsPromised = require('chai-as-promised')
const getServer = require('./lib/server')

chai.use(charAsPromised)

/* eslint-disable no-undef */
before(async () => {
    process.env.NODE_ENV = 'test'
    global.should = chai.should()
    global.server = await getServer()
})

after((done) => {
    done()
})
