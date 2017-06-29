const client = require('./lib/client')

const platform = 'windows'
const clientName = 'agtop'
const newClient = `client_${Date.now()}`

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
    it('with all required fileds', (done) => {
        client()
        .post('/browser/create')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({
            client: 'tripleone',
            homepage: 'https://tripleonetech.net',
            company: '合衆科技',
        })
        .expect(200)
        .end((err, res) => {
            should.not.exist(err)
            done()
        })
    })

    it('without client', (done) => {
        client()
        .post('/browser/create')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({
            homepage: 'https://tripleonetech.net',
            company: '合衆科技',
        })
        .expect(400)
        .end((err, res) => {
            should.not.exist(err)
            res.body.should.have.property('error')
            res.body.error.should.have.property('code').and.equal('ValidationFailedError')
            res.body.error.should.have.property('message')
            done()
        })
    })
})

describe('Update browser', () => {
    it('Update browser download link without updating version', (done) => {
        client()
        .post('/browser/version')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({
            platform,
            client: clientName,
            link: 'https://download.link',
        })
        .expect(204)
        .end((err, res) => {
            should.not.exist(err)
            done()
        })
    })

    it('get version by platform and client name', (done) => {
        client()
        .get(`/browser/version?platform=${platform}&client=${clientName}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
            should.not.exist(err)
            res.body.should.have.property('version').and.equal(env.browser.version)
            res.body.should.have.property('link')
            done()
        })
    })

    it('Update browser link and version', (done) => {
        client()
        .post('/browser/version')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({
            platform,
            client: clientName,
            link: 'https://download.link',
            version: true,
        })
        .expect(204)
        .end((err, res) => {
            should.not.exist(err)
            done()
        })
    })
    
    it('get version after version updated', (done) => {
        client()
        .get(`/browser/version?platform=${platform}&client=${clientName}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
            should.not.exist(err)
            res.body.should.have.property('version').and.not.equal(env.browser.version)
            res.body.should.have.property('link')
            done()
        })
    })
    
    it('Update version by new client', (done) => {
        client()
        .post('/browser/version')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({
            platform,
            client: newClient,
            link: 'https://download.link',
        })
        .expect(204)
        .end((err, res) => {
            should.not.exist(err)
            done()
        })
    })
    
    it('get version after version updated', (done) => {
        client()
        .get(`/browser/version?platform=${platform}&client=${newClient}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
            should.not.exist(err)
            res.body.should.have.property('version').and.equal('2.9.0')
            res.body.should.have.property('link')
            done()
        })
    })
    
})
