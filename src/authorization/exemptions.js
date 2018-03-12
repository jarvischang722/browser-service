const url = require('url')
const mm = require('micromatch')

const routes = []

const add = (path) => {
  if (!path) return
  path = path.toLowerCase()
  if (!path.startsWith('/')) {
    path = `/${path}`
  }
  routes.push(path)
}

const has = (path) => {
  if (!path) return false
  const pathname = url.parse(path).pathname.toLowerCase()
  return mm.any(pathname, routes)
}

module.exports = { add, has }
