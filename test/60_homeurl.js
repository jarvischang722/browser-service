const client = require('./lib/client')

const CLIENT_NAME = 'clientName'

describe('Get homeurl and avail ss list', () => {
  it('by tripleone', (done) => {
    client()
    .get(`/browser/homeUrlAndSsInfo?clientName=${CLIENT_NAME}`)
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

  it('get homeurl', (done) => {
    client()
    .get(`/user/getHomeUrl?clientName=${CLIENT_NAME}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('homeUrlList')
      res.body.homeUrlList.should.to.be.an('array')
      done()
    })
  })

  it('get homeurl no clientName', (done) => {
    client()
    .get('/user/getHomeUrl')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect(400)
    .end((err, res) => {
      should.not.exist(err)
      done()
    })
  })
})
