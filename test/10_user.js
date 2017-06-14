const client = require('./lib/client')

const player = {
    username: `testuser_${Date.now()}`,
    email: 'test@email.com',
    password: 'pass1234',
}

describe('User', () => {
    it('Sign up', (done) => {
        client()
        .post('/user/signup')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send(player)
        .expect(201)
        .end((err, res) => {
            should.not.exist(err)
            res.body.should.have.property('id')
            res.body.should.have.property('token')
            done()
        })
    })

    it('Sign in', (done) => {
        const { username, password } = player
        client()
        .post('/user/login')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({ username, password })
        .expect(200)
        .end((err, res) => {
            should.not.exist(err)
            res.body.should.have.property('player')
            res.body.player.should.have.property('id')
            res.body.player.should.have.property('token')
            res.body.should.have.property('ssinfo')
            env.player = res.body.player
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
            res.body.error.should.have.property('code').and.equal('UserUnauthorizedError')
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

    it('Get test info after login', (done) => {
        client()
        .get('/test/user')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('X-Auth-Key', env.player.token)
        .expect(200)
        .end((err, res) => {
            should.not.exist(err)
            res.body.should.have.property('user').and.equal('test')
            done()
        })
    })

    it('Get test info failed without auth token', (done) => {
        client()
        .get('/test/user')
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

    it('Login by third party account', (done) => {
        client()
        .post('/user/login/third')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({
            username: 'username',
            password: 'password',
            client: 'playercenter',
        })
        .expect(200)
        .end((err, res) => {
            should.not.exist(err)
            res.body.should.have.property('id')
            done()
        })
    })
})
