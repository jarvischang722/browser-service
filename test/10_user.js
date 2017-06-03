const client = require('./lib/client')

const player = {
    username: `testuser_${Date.now()}`,
    email: 'test@email.com',
    password: 'pass1234',
}

describe('User', () => {
    it('Get test user', (done) => {
        client()
        .get('/user/test')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
            should.not.exist(err)
            res.body.should.have.property('user').and.equal('test')
            done()
        })
    })

    it('Sign up', (done) => {
        client()
        .post('/user/signup')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send(player)
        .expect(201)
        .end((err) => {
            should.not.exist(err)
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
            res.body.should.have.property('token')
            res.body.should.have.property('ssinfo')
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
})
