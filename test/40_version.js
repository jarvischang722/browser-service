const client = require('./lib/client')

const platform = 'Windows'
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

describe('Get browser', () => {
  it('list of self', (done) => {
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
        i.should.have.property('id')
        i.should.have.property('platform')
        i.should.have.property('status')
        i.should.have.property('link')
        i.should.have.property('version')
        env.browserId = i.id
      }
      done()
    })
  })

  it('list of child', (done) => {
    client()
    .get(`/browser/list?user=${env.user2.id}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('total')
      res.body.should.have.property('items')
      for (const i of res.body.items) {
        i.should.have.property('id')
        i.should.have.property('platform')
        i.should.have.property('status')
        i.should.have.property('link')
        i.should.have.property('version')
        env.browserId2 = i.id
      }
      done()
    })
  })

  it('detail of self', (done) => {
    client()
    .get(`/browser/detail?id=${env.browserId}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('id')
      res.body.should.have.property('platform')
      res.body.should.have.property('status')
      res.body.should.have.property('link')
      res.body.should.have.property('version')
      done()
    })
  })

  it('detail of child', (done) => {
    client()
    .get(`/browser/detail?id=${env.browserId2}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('id')
      res.body.should.have.property('platform')
      res.body.should.have.property('status')
      res.body.should.have.property('link')
      res.body.should.have.property('version')
      done()
    })
  })
})

describe('Update browser', () => {
  it('for self by new platform', (done) => {
    client()
    .post('/browser/info')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .send({
      platform: 'iOS',
      version: '3.0.0',
      link: 'https://apple.com',
    })
    .expect(204)
    .end((err, res) => {
      should.not.exist(err)
      done()
    })
  })

  it('for self', (done) => {
    client()
    .post('/browser/info')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .send({
      platform: 'Windows',
      version: '3.0.0',
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
      user: env.user2.id,
      platform: 'macOS',
      version: '3.0.0',
      link: 'https://live.com',
    })
    .expect(204)
    .end((err, res) => {
      should.not.exist(err)
      done()
    })
  })

  it('for child by new platform', (done) => {
    client()
    .post('/browser/info')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .send({
      user: env.user2.id,
      platform: 'iOS',
      version: '2.10.10',
      link: 'https://apple2.com',
    })
    .expect(204)
    .end((err, res) => {
      should.not.exist(err)
      done()
    })
  })
})
