const client = require('./lib/client')

const tripleone = {
  username: 'tripleone',
  password: 'pass1234',
}
const newAgent = {
  username: `newagent_${Date.now()}`,
}

describe('User', () => {
  it('Sign in', (done) => {
    const { username, password } = tripleone
    client()
    .post('/user/login')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send({ username, password })
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('id')
      res.body.should.have.property('role')
      res.body.should.have.property('token')
      env.user = res.body
      done()
    })
  })

  it('Login failed', (done) => {
    client()
    .post('/user/login')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send({
      username: 'wrong',
      password: 'wrong',
    })
    .expect(401)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('error')
      res.body.error.should.have.property('code').and.equal('UnauthorizedError')
      res.body.error.should.have.property('message')
      done()
    })
  })

  it('Login failed without required fields', (done) => {
    client()
    .post('/user/login')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect(400)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('error')
      res.body.error.should.have.property('code').and.equal('ValidationFailedError')
      res.body.error.should.have.property('message')
      done()
    })
  })

  it('Recurrent', (done) => {
    client()
    .get('/user/recurrent')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('id')
      res.body.should.have.property('role')
      res.body.should.have.property('token')
      done()
    })
  })

  it('Get user profile after sign in', (done) => {
    client()
    .get('/user/profile')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('id')
      res.body.should.have.property('role')
      res.body.should.have.property('username')
      res.body.should.have.property('name')
      res.body.should.have.property('icon')
      res.body.should.have.property('homeUrl')
      res.body.should.have.property('expireIn')
      res.body.should.have.property('browser')
      res.body.browser.should.have.property('status')
      res.body.browser.should.have.property('link')
      res.body.browser.should.have.property('version')
      res.body.browser.version.should.have.property('local')
      res.body.browser.version.should.have.property('server')
      done()
    })
  })

  it('Create new agent', (done) => {
    client()
    .post('/user/create')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .send({
      username: newAgent.username,
      role: 1,
      expireIn: Math.round(Date.now() / 1000) + 3600,
      name: '新代理',
    })
    .expect(201)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('id')
      res.body.should.have.property('username')
      res.body.should.have.property('password')
      newAgent.password = res.body.password
      done()
    })
  })

  it('Create new agent but username duplicated', (done) => {
    client()
    .post('/user/create')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .send({
      username: newAgent.username,
      role: 1,
      expireIn: Math.round(Date.now() / 1000) + 3600,
      name: '新代理',
    })
    .expect(400)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('error')
      res.body.error.should.have.property('code').and.equal('UserDuplicatedError')
      done()
    })
  })

  it('Create new agent with only username', (done) => {
    client()
    .post('/user/create')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .send({
      username: `agent2_${Date.now()}`,
    })
    .expect(201)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('id')
      res.body.should.have.property('username')
      res.body.should.have.property('password')
      done()
    })
  })

  it('Sign in by new agent', (done) => {
    const { username, password } = newAgent
    client()
    .post('/user/login')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send({ username, password })
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('token')
      env.user2 = res.body
      done()
    })
  })

  it('Create new agent but invalid expire in time', (done) => {
    client()
    .post('/user/create')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user2.token)
    .send({
      username: `newagenttt_${Date.now()}`,
      role: 1,
      expireIn: Math.round(Date.now() / 1000) + 7200,
      name: '新代理',
    })
    .expect(400)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('error')
      res.body.error.should.have.property('code').and.equal('InvalidExpireInError')
      done()
    })
  })

  it('Get child user profile', (done) => {
    client()
    .get(`/user/profile?id=${env.user2.id}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('id')
      res.body.should.have.property('role')
      res.body.should.have.property('username')
      res.body.should.have.property('name')
      res.body.should.have.property('icon')
      res.body.should.have.property('homeUrl')
      res.body.should.have.property('expireIn')
      res.body.should.have.property('browser')
      done()
    })
  })

  it('Get user profile, but not child', (done) => {
    client()
    .get('/user/profile?id=999999')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .expect(404)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('error')
      res.body.error.should.have.property('code').and.equal('UserNotFoundError')
      done()
    })
  })

  it('Get profile failed without auth token', (done) => {
    client()
    .get('/user/profile')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect(401)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('error')
      res.body.error.should.have.property('code').and.equal('UnauthorizedError')
      done()
    })
  })

  it('Update profile', (done) => {
    client()
    .post('/user/profile')
    .set('Content-Type', 'multipart/form-data')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .field('name', 'tripleonetech')
    .field('homeUrl', [
      'http://www.demo.tripleonetech.com/',
      'https://www.tripleonetech.com/',
    ])
    .attach('icon', 'test/files/icon.ico')
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('id')
      res.body.should.have.property('name')
      res.body.should.have.property('icon')
      res.body.should.have.property('homeUrl')
      done()
    })
  })

  it('Invalid homeurl', (done) => {
    client()
    .post('/user/profile')
    .set('Content-Type', 'multipart/form-data')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .field('name', 'tripleonetech')
    .field('homeUrl', [
      'xxx',
      'https://www.tripleonetech.com/',
    ])
    .attach('icon', 'test/files/icon.ico')
    .expect(400)
    .end((err, res) => {
      res.body.should.have.property('error')
      res.body.error.should.have.property('code').and.equal('ValidationFailedError')
      done()
    })
  })

  it('Update child profile', (done) => {
    client()
    .post('/user/profile')
    .set('Content-Type', 'multipart/form-data')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .field('id', env.user2.id)
    .field('name', '澳门新葡京')
    .field('homeUrl', [
      'http://www.agtop.t1t.games/',
    ])
    .attach('icon', 'test/files/icon.ico')
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('id')
      res.body.should.have.property('name')
      res.body.should.have.property('icon')
      res.body.should.have.property('homeUrl')
      done()
    })
  })

  it('Update child expire time', (done) => {
    client()
    .post('/user/expire')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .send({
      id: env.user2.id,
      expireIn: Math.round(Date.now() / 1000) + 3000,
    })
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('id')
      res.body.should.have.property('expireIn')
      done()
    })
  })

  it('Cannot change expire time of self', (done) => {
    client()
    .post('/user/expire')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .send({
      id: env.user.id,
      expireIn: Math.round(Date.now() / 1000) + 3000,
    })
    .expect(403)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('error')
      res.body.error.should.have.property('code').and.equal('NoPermissionError')
      done()
    })
  })

  it('Get user profile after sign in', (done) => {
    client()
    .get('/user/profile')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('id')
      res.body.should.have.property('role')
      res.body.should.have.property('username')
      res.body.should.have.property('name')
      res.body.should.have.property('expireIn')
      res.body.should.have.property('icon')
      res.body.should.have.property('browser')
      res.body.browser.should.have.property('status')
      res.body.browser.should.have.property('link')
      res.body.browser.should.have.property('version')
      res.body.browser.version.should.have.property('local')
      res.body.browser.version.should.have.property('server')
      res.body.should.have.property('homeUrl').and.instanceOf(Array)
      done()
    })
  })

  it('Get children', (done) => {
    client()
    .get('/user/list')
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
        i.should.have.property('username')
        i.should.have.property('name')
        i.should.have.property('expireIn')
        i.should.have.property('role')
      }
      done()
    })
  })

  it('Get children by page', (done) => {
    client()
    .get('/user/list?pagesize=1')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('total')
      res.body.should.have.property('items').and.instanceOf(Array).with.lengthOf(1)
      for (const i of res.body.items) {
        i.should.have.property('id')
        i.should.have.property('username')
        i.should.have.property('name')
        i.should.have.property('expireIn')
        i.should.have.property('role')
      }
      done()
    })
  })

  it('Get children by page', (done) => {
    client()
    .get('/user/list?page=999999')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Auth-Key', env.user.token)
    .expect(200)
    .end((err, res) => {
      should.not.exist(err)
      res.body.should.have.property('total')
      res.body.should.have.property('items').and.instanceOf(Array).and.be.empty
      done()
    })
  })
})
