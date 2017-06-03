const exempt = require('../authorization/exemptions').add

const bind = (route, config) => {
    route.get('/', (req, res) => { res.send('Tripleonetech discover service') })

    require('./user')(route, config, exempt)
    require('./browser')(route, config, exempt)
}

exempt('/')

module.exports = { bind }
