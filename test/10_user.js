const client = require('./lib/client')

const tripleone = {
    username: 'tripleone',
    password: 'pass1234',
}

const client2 = {
    id: 2,
}

describe('User', () => {
    // it('Sign up', (done) => {
    //     client()
    //     .post('/user/signup')
    //     .set('Content-Type', 'application/json')
    //     .set('Accept', 'application/json')
    //     .send(user)
    //     .expect(201)
    //     .end((err, res) => {
    //         should.not.exist(err)
    //         res.body.should.have.property('id')
    //         res.body.should.have.property('token')
    //         done()
    //     })
    // })

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
            res.body.should.have.property('token')
            res.body.should.have.property('username')
            res.body.should.have.property('name')
            res.body.should.have.property('expireIn')
            res.body.should.have.property('browser')
            res.body.browser.should.have.property('link')
            res.body.browser.should.have.property('version')
            res.body.browser.version.should.have.property('local')
            res.body.browser.version.should.have.property('server')
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
            res.body.should.have.property('username')
            res.body.should.have.property('name')
            res.body.should.have.property('expireIn')
            res.body.should.have.property('browser')
            res.body.browser.should.have.property('link')
            res.body.browser.should.have.property('version')
            res.body.browser.version.should.have.property('local')
            res.body.browser.version.should.have.property('server')
            done()
        })
    })

    it('Get child user profile', (done) => {
        client()
        .get(`/user/profile?id=${client2.id}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('X-Auth-Key', env.user.token)
        .expect(200)
        .end((err, res) => {
            should.not.exist(err)
            res.body.should.have.property('id')
            res.body.should.have.property('username')
            res.body.should.have.property('name')
            res.body.should.have.property('expireIn')
            res.body.should.have.property('browser')
            res.body.browser.should.have.property('link')
            res.body.browser.should.have.property('version')
            res.body.browser.version.should.have.property('local')
            res.body.browser.version.should.have.property('server')
            env.client2 = client2
            done()
        })
    })

    it('Get user profile, but not child', (done) => {
        client()
        .get('/user/profile?id=99')
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
        .set('Content-Type', 'application/json')
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
            res.body.should.have.property('updated').and.be.ok
            done()
        })
    })

    it('Invalid homeurl', (done) => {
        client()
        .post('/user/profile')
        .set('Content-Type', 'application/json')
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
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('X-Auth-Key', env.user.token)
        .field('id', env.client2.id)
        .field('name', '澳门新葡京')
        .field('homeUrl', [
            'http://www.agtop.t1t.games/',
        ])
        .attach('icon', 'test/files/icon.ico')
        .expect(200)
        .end((err, res) => {
            should.not.exist(err)
            res.body.should.have.property('updated').and.be.ok
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
            res.body.should.have.property('username')
            res.body.should.have.property('name')
            res.body.should.have.property('expireIn')
            res.body.should.have.property('icon')
            res.body.should.have.property('browser')
            res.body.browser.should.have.property('link')
            res.body.browser.should.have.property('version')
            res.body.browser.version.should.have.property('local')
            res.body.browser.version.should.have.property('server')
            res.body.should.have.property('homeUrl').and.instanceOf(Array)
            done()
        })
    })
})
