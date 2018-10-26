const client = require('./lib/client')

let INSERT_ID = ''
describe('Keyword', () => {
  it('update', done => {
    client()
      .post('/keyword/update')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('X-Auth-Key', env.user.token)
      .send({ userid: 1, keyword: '彩票' })
      .expect(200)
      .end((err, res) => {
        should.not.exist(err)
        res.body.should.have.property('insertId').and.be.an('number')

        INSERT_ID = res.body.insertId

        done()
      })
  })

  it('update no userid', done => {
    client()
      .post('/keyword/update')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('X-Auth-Key', env.user.token)
      .send({ keyword: '彩票' })
      .expect(400)
      .end((err, res) => {
        should.not.exist(err)
        done()
      })
  })

  it('update not found userid', done => {
    client()
      .post('/keyword/update')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('X-Auth-Key', env.user.token)
      .send({ userid: 500, keyword: '彩票' })
      .expect(500)
      .end((err, res) => {
        should.not.exist(err)
        done()
      })
  })


  it('list', done => {
    client()
      .get('/keyword/list')
      .set('Content-Type', 'application/json')
      .set('X-Auth-Key', env.user.token)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err)
        res.body.should.have.property('total').and.be.a('number')
        res.body.should.have.property('items').and.instanceOf(Array)
        for (const i of res.body.items) {
          i.should.have.property('id')
          i.should.have.property('username')
          i.should.have.property('keywords').and.to.be.instanceOf(Array)
        }
        done()
      })
  })

  it('delete', done => {
    client()
      .post('/keyword/delete')
      .set('Content-Type', 'application/json')
      .set('X-Auth-Key', env.user.token)
      .send({ keywordList: [INSERT_ID] })
      .expect(200)
      .end((err, res) => {
        should.not.exist(err)
        res.body.should.have.property('affectedRows').and.be.a('number').and.to.be.at.least(1)
        done()
      })
  })
})
