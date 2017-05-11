const bind = (route, config) => {
    route.get('/', (req, res) => { res.send('Tripleonetech discover service') })

    require('./user')(route, config)
    // require('./other-routes')(route, config)
    // ...
}

module.exports = { bind }