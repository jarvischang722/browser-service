const client = require('./lib/client')

describe('Get browser latest version and download link', () => {
    it('by platform and client name', (done) => {
        client()
        .get('/browser/version?platform=windows&client=agtop')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
            should.not.exist(err)
            res.body.should.have.property('version')
            res.body.should.have.property('link')
            done()
        })
    })

    it('without params', (done) => {
        client()
        .get('/browser/version')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
            should.not.exist(err)
            res.body.should.have.property('windows')
            /* eslint-disable no-restricted-syntax */
            for (const c of Object.values(res.body.windows)) {
                c.should.have.property('version')
                c.should.have.property('link')
            }
            res.body.should.have.property('mac')
            res.body.should.have.property('ios')
            res.body.should.have.property('android')
            done()
        })
    })

    it('by platform', (done) => {
        client()
        .get('/browser/version?platform=windows')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
            for (const c of Object.values(res.body)) {
                c.should.have.property('version')
                c.should.have.property('link')
            }
            done()
        })
    })

    it('by client name', (done) => {
        client()
        .get('/browser/version?client=agtop')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
            should.not.exist(err)
            res.body.should.have.property('windows')
            res.body.windows.should.have.property('version')
            res.body.windows.should.have.property('link')
            res.body.should.have.property('mac')
            res.body.should.have.property('ios')
            res.body.should.have.property('android')
            done()
        })
    })

    it('by wrong platform and right client', (done) => {
        client()
        .get('/browser/version?platform=wrong&client=agtop')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err) => {
            should.not.exist(err)
            done()
        })
    })

    it('by right platform and wrong client', (done) => {
        client()
        .get('/browser/version?platform=windows&client=wrong')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err) => {
            should.not.exist(err)
            done()
        })
    })

    it('by wrong platform and wrong client', (done) => {
        client()
        .get('/browser/version?platform=wrong&client=wrong')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err) => {
            should.not.exist(err)
            done()
        })
    })

    it('by wrong platform only', (done) => {
        client()
        .get('/browser/version?platform=wrong')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err) => {
            should.not.exist(err)
            done()
        })
    })

    it('by wrong client only', (done) => {
        client()
        .get('/browser/version?client=wrong')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err) => {
            should.not.exist(err)
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
