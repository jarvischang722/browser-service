const client = require('./lib/client')

const USER_ID = 1

describe('BlackWhite', () => {
  it('update', done => {
    client()
      .post('/blackWhite/update')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('X-Auth-Key', env.user.token)
      .send({ userid: USER_ID, blackList: '192.168.10.0/24' })
      .expect(200)
      .end((err, res) => {
        should.not.exist(err)
        res.body.should.have.property('userid')
        res.body.should.have.property('name')
        res.body.should.have.property('black_list')
        res.body.should.have.property('white_list')
        done()
      })
  })

  it('update not found userid', done => {
    client()
      .post('/blackWhite/update')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('X-Auth-Key', env.user.token)
      .send({ blackList: '192.168.10.0/24' })
      .expect(400)
      .end((err, res) => {
        should.not.exist(err)
        done()
      })
  })

  it('list', done => {
    client()
      .get('/blackWhite/list')
      .set('Content-Type', 'application/json')
      .set('X-Auth-Key', env.user.token)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err)
        res.body.should.have.property('total').and.be.a('number')
        res.body.should.have.property('items').and.instanceOf(Array)
        for (const i of res.body.items) {
          i.should.have.property('userid')
          i.should.have.property('name')
          i.should.have.property('black_list')
          i.should.have.property('white_list')
        }
        done()
      })
  })

  it('detail', done => {
    client()
      .get(`/blackWhite/detail?userid=${USER_ID}`)
      .set('Content-Type', 'application/json')
      .set('X-Auth-Key', env.user.token)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err)
        res.body.should.have.property('userid')
        res.body.should.have.property('name')
        res.body.should.have.property('black_list')
        res.body.should.have.property('white_list')
        done()
      })
  })

  it('detail no userid', done => {
    client()
      .get('/blackWhite/detail')
      .set('Content-Type', 'application/json')
      .set('X-Auth-Key', env.user.token)
      .expect(400)
      .end((err, res) => {
        should.not.exist(err)
        done()
      })
  })
})
