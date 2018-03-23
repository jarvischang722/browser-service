const exempt = require('../authorization/exemptions').add

const bind = (route, config) => {
  require('./user')(route, config, exempt)
  require('./browser')(route, config, exempt)
  require('./short')(route, config, exempt)
  require('./version')(route, config, exempt)

  route.get('/', (req, res) => { res.send('Tripleonetech browser api service 2.0') })
}

exempt('/')

module.exports = { bind }
