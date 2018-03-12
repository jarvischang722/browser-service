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
