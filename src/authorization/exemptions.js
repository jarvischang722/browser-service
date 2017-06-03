const url = require('url')

const routes = {}

const add = (path) => {
    if (!path) return
    path = path.toLowerCase()
    if (!path.startsWith('/')) {
        path = `/${path}`
    }
    routes[path] = true
}

const has = (path) => {
    if (routes['*']) return true
    if (!path) return false
    const pathname = url.parse(path).pathname.toLowerCase()
    return routes[pathname] || false
}

module.exports = { add, has }
