const exempt = require('../authorization/exemptions').add
const fs = require('fs')

const bind = (route, config) => {
  fs.readdirSync(__dirname).forEach(file => {
    if (file !== 'index.js') {
      require(`./${file}`)(route, config, exempt)
    }
  })
  route.get('/', (req, res) => {
    res.send('Tripleonetech browser api service 2.0')
  })
}

exempt('/')
exempt('/pub_plugins')

module.exports = { bind }
