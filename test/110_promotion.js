const client = require('./lib/client')

describe('Promotion', () => {
  it('update', done => {
    client()
      .post('/promotion/updateSort')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('X-Auth-Key', env.user.token)
      .send({ agentSortList: [{ userid: 1, sort: 1 }, { userid: 2, sort: 10 }] })
      .expect(200)
      .end((err, res) => {
        should.not.exist(err)
        res.body.should.have.property('isUpdated').and.to.be.true
        done()
      })
  })
  it('update without agentSortList', done => {
    client()
      .post('/promotion/updateSort')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('X-Auth-Key', env.user.token)
      .expect(400)
      .end((err, res) => {
        should.not.exist(err)
        done()
      })
  })

  it('list', done => {
    client()
      .get('/promotion/list')
      .set('Content-Type', 'application/json')
      .set('X-Auth-Key', env.user.token)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err)
        res.body.should.have.property('items').and.instanceOf(Array)
        for (const i of res.body.items) {
          i.should.have.property('username').and.be.a('string')
          i.should.have.property('name').and.be.a('string')
          i.should.have.property('sort').and.be.a('number')
        }
        done()
      })
  })
})
