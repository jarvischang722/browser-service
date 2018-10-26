const client = require('./lib/client')
const StrUtil = require('../src/utils/str')

const username = StrUtil.random(8)
const password = '123456789'
const playerName = 'tripleone_test'
const contactNum = '0912345678'
let PLAYER_ID = ''

describe('Player', () => {
  it('register', done => {
    client()
      .post('/player/register')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('X-Auth-Key', env.user.token)
      .send({ username, password, playerName, contactNum })
      .expect(200)
      .end((err, res) => {
        should.not.exist(err)
        res.body.should.have.property('success').and.to.equal(true)
        res.body.should.have.property('user').and.be.an('object')
        PLAYER_ID = res.body.user.id
        done()
      })
  })

  it('list', done => {
    client()
      .post('/player/list')
      .set('Content-Type', 'application/json')
      .set('X-Auth-Key', env.user.token)
      .send({ page: 1, pagesize: 10 })
      .expect(200)
      .end((err, res) => {
        should.not.exist(err)
        res.body.should.have.property('total').and.be.a('number')
        res.body.should.have.property('items').and.instanceOf(Array)
        for (const i of res.body.items) {
          i.should.have.property('id')
          i.should.have.property('username')
          i.should.have.property('name')
          i.should.have.property('contact_number')
          i.should.have.property('email')
          i.should.have.property('gender')
          i.should.have.property('birthdate')
          i.should.have.property('status')
          i.should.have.property('disable_expire')
        }
        done()
      })
  })

  it('get player detail', done => {
    client()
      .get(`/player/detail?playerId=${PLAYER_ID}`)
      .set('Content-Type', 'application/json')
      .set('X-Auth-Key', env.user.token)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err)
        res.body.should.have.property('id').and.be.a('number')
        res.body.should.have.property('username').and.be.a('string')
        res.body.should.have.property('name').and.be.a('string')
        res.body.should.have.property('contact_number').and.be.a('string')
        res.body.should.have
          .property('status')
          .and.be.a('string')
          .and.to.be.oneOf(['0', '1'])
        done()
      })
  })

  it('update player status', done => {
    client()
    .post('/player/updateSta')
    .set('Content-Type', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .send({ playerId: PLAYER_ID, status: '0', disableExpire: '2018/12/31' })
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('id').and.be.a('number')
      res.body.should.have.property('name').and.be.a('string')
      res.body.should.have.property('status').and.be.a('string').to.equal('0')
      res.body.should.have.property('disable_expire')
      done()
    })
  })

  it('update player status no player id', done => {
    client()
    .post('/player/updateSta')
    .set('Content-Type', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .send({ status: '0', disableExpire: '2018/12/31' })
    .expect(400)
    .end((err, res) => {
      should.not.exist(err)
      done()
    })
  })
})
