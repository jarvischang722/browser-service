const bind = (route, config) => {
    require('./user')(route, config)
}

module.exports = { bind }