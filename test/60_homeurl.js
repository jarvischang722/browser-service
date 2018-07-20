const client = require('./lib/client')

describe('Get homeurl and avail ss list', () => {
  it('by tripleone', (done) => {
    client()
    .get('/browser/homeUrlAndSsInfo?clientName=tripleone')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('homeUrlList')
      res.body.should.have.property('ssList')
      res.body.homeUrlList.should.to.be.an('array')
      res.body.ssList.should.to.be.an('array')
      done()
    })
  })
  it('by no params', (done) => {
    client()
    .get('/browser/homeUrlAndSsInfo')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect(400)
    .end((err, res) => {
      should.not.exist(err)
      done()
    })
  })
})
