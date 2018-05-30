const client = require('./lib/client')

describe('Get ss list', () => {
  it('by no param', (done) => {
    client()
    .get('/browser/ss')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('ss')
      done()
    })
  })
})
