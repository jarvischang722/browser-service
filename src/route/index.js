const bind = (route, config) => {
    route.get('/', (req, res) => { res.send('Tripleonetech discover service') })

    require('./user')(route, config)
    require('./browser')(route, config)
}

module.exports = { bind }