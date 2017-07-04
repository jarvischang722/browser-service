const client = require('./lib/client')

const platform = 'windows'
const clientName = 'agtop'

describe('Get browser latest version and download link', () => {
    it('by platform and client name', (done) => {
        client()
        .get(`/browser/version?platform=${platform}&client=${clientName}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
            should.not.exist(err)
            res.body.should.have.property('version')
            res.body.should.have.property('link')
            env.browser = res.body
            done()
        })
    })

    it('without params', (done) => {
        client()
        .get('/browser/version')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(400)
        .end((err, res) => {
            should.not.exist(err)
            res.body.should.have.property('error')
            res.body.error.should.have.property('code').and.equal('ValidationFailedError')
            done()
        })
    })
})

describe('Generate browser', () => {
    it('for self', (done) => {
        client()
        .post('/browser/create')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('X-Auth-Key', env.user.token)
        .expect(204)
        .end((err, res) => {
            should.not.exist(err)
            done()
        })
    })

    it('for child', (done) => {
        client()
        .post('/browser/create')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('X-Auth-Key', env.user.token)
        .send({
            id: env.user.id,
        })
        .expect(204)
        .end((err, res) => {
            should.not.exist(err)
            done()
        })
    })
})

describe('Get browser info', () => {
    it('of self', (done) => {
        client()
        .get('/browser/info')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('X-Auth-Key', env.user.token)
        .expect(200)
        .end((err, res) => {
            should.not.exist(err)
            res.body.should.have.property('link')
            res.body.should.have.property('version')
            res.body.version.should.have.property('local')
            res.body.version.should.have.property('server')
            done()
        })
    })
})
