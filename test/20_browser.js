const client = require('./lib/client')

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
