const client = require('./lib/client')

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

describe('Long item', () => {
  it('get list', (done) => {
    client()
    .get('/short/list')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('total')
      res.body.should.have.property('items').and.instanceOf(Array)
      for (const i of res.body.items) {
        i.should.have.property('id')
        i.should.have.property('short')
        i.should.have.property('long')
        i.should.have.property('site_name')
        i.should.have.property('logo_url')
      }
      env.longItem = res.body.items[0]
      done()
    })
  })

  it('get detail', (done) => {
    client()
    .get(`/short/detail?id=${env.longItem.id}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('id')
      res.body.should.have.property('short')
      res.body.should.have.property('long')
      res.body.should.have.property('site_name')
      res.body.should.have.property('logo_url')
      done()
    })
  })

  it('update', (done) => {
    const { id, short, long, site_name } = env.longItem
    client()
    .post('/short/update')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .field('id', id)
    .field('short', short)
    .field('long', long)
    .field('site_name', site_name)
    .attach('image', 'test/files/image.png')
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('id')
      res.body.should.have.property('short')
      res.body.should.have.property('long')
      res.body.should.have.property('site_name')
      res.body.should.have.property('logo_url')
      done()
    })
  })

  it('add', (done) => {
    const short = `short_${Date.now()}`
    const { long, site_name } = env.longItem
    client()
    .post('/short/add')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .field('short', short)
    .field('long', long)
    .field('site_name', site_name)
    .attach('image', 'test/files/image.png')
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('id')
      res.body.should.have.property('short')
      res.body.should.have.property('long')
      res.body.should.have.property('site_name')
      res.body.should.have.property('logo_url')
      done()
    })
  })
})
