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
      id: env.user2.id,
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
      res.body.should.have.property('status')
      res.body.should.have.property('link')
      res.body.should.have.property('version')
      res.body.version.should.have.property('local')
      res.body.version.should.have.property('server')
      done()
    })
  })
})

describe('Get long by short', () => {
  it('by no param', (done) => {
    client()
    .get('/browser/short')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('long').and.equal('')
      done()
    })
  })

  it('by t1t', (done) => {
    client()
    .get('/browser/short?q=t1t')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('long').and.equal('www.tripleonetech.net')
      done()
    })
  })

  it('by tot', (done) => {
    client()
    .get('/browser/short?q=tot')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('long').and.equal('www.tripleonetech.net')
      done()
    })
  })

  it('by apple', (done) => {
    client()
    .get('/browser/short?q=apple')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('long').and.equal('www.apple.com')
      done()
    })
  })

  it('by invalid', (done) => {
    client()
    .get('/browser/short?q=xxx')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('long').and.equal('')
      done()
    })
  })
})

describe('Get browser list', () => {
  it('of self', (done) => {
    client()
    .get('/browser/list')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('total')
      res.body.should.have.property('items')
      for (const i of res.body.items) {
        i.should.have.property('platform')
        i.should.have.property('status')
        i.should.have.property('link')
        i.should.have.property('version')
      }
      done()
    })
  })
})

describe('Update browser', () => {
  it('for self', (done) => {
    client()
    .post('/browser/info')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .send({
      platform: 'windows',
      version: '2.9.9',
      link: 'https://google.com',
    })
    .expect(204)
    .end((err, res) => {
      should.not.exist(err)
      done()
    })
  })

  it('for child', (done) => {
    client()
    .post('/browser/info')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .send({
      id: env.user2.id,
      platform: 'mac',
      version: '2.9.10',
      link: 'https://live.com',
    })
    .expect(204)
    .end((err, res) => {
      should.not.exist(err)
      done()
    })
  })
})
