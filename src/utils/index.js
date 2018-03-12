const { ncp } = require('ncp')
const rcedit = require('rcedit')
const asar = require('asar')
const innoSetup = require('innosetup-compiler')

const copy = (src, dest, options) => {
  const promise = (resolve, reject) => {
    if (options) {
      ncp(src, dest, options, (err) => {
        if (err) return reject(err)
        return resolve()
      })
    } else {
      ncp(src, dest, (err) => {
        if (err) return reject(err)
        return resolve()
      })
    }
  }
  return new Promise(promise)
}

const rceditSync = (exePath, options) => {
  const promise = (resolve, reject) => {
    rcedit(exePath, options, (err) => {
      if (err) return reject(err)
      return resolve()
    })
  }
  return new Promise(promise)
}

const asarSync = (src, dest) => {
  const promise = (resolve, reject) => {
    asar.createPackage(src, dest, (err) => {
      if (err) return reject(err)
      return resolve()
    })
  }
  return new Promise(promise)
}

const compiler = (iss, options) => {
  const promise = (resolve, reject) => {
    innoSetup(iss, options, (err) => {
      if (err) return reject(err)
      return resolve()
    })
  }
  return new Promise(promise)
}

module.exports = {
  copy,
  rceditSync,
  asarSync,
  compiler,
}
