const exempt = require('../authorization/exemptions').add
const path = require('path')

const bind = (route, config) => {
  require('./user')(route, config, exempt)
  require('./browser')(route, config, exempt)
  require('./short')(route, config, exempt)
  require('./version')(route, config, exempt)

  // website
  route.get('/smart', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public/dist/index.html'))
  })
}

exempt('/')
exempt('/smart')
exempt('/smart/')
exempt('/smart/*')

module.exports = { bind }
