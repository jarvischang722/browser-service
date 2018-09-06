const { ncp } = require('ncp')
const rcedit = require('rcedit')
const asar = require('asar')
const path = require('path')
const fs = require('fs')
const request = require('request')

const copy = (src, dest, options) => {
  const promise = (resolve, reject) => {
    if (options) {
      ncp(src, dest, options, err => {
        if (err) return reject(err)
        return resolve()
      })
    } else {
      ncp(src, dest, err => {
        if (err) return reject(err)
        return resolve()
      })
    }
  }
  return new Promise(promise)
}

const rceditSync = (exePath, options) => {
  const promise = (resolve, reject) => {
    rcedit(exePath, options, err => {
      if (err) return reject(err)
      return resolve()
    })
  }
  return new Promise(promise)
}

const asarSync = (src, dest) => {
  const promise = (resolve, reject) => {
    asar.createPackage(src, dest, err => {
      if (err) return reject(err)
      return resolve()
    })
  }
  return new Promise(promise)
}

const compiler = (clientOpt, projectPath) => {
  const builderPath = path.join(projectPath, 'build/install-script/builder.js')
  const builder = require(builderPath)
  const promise = (resolve, reject) => {
    builder(clientOpt, (err, filename) => {
      if (err) return reject(err)
      return resolve(filename)
    })
  }
  return new Promise(promise)
}

const download = (link, dest) =>
  new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    request
      .get(link)
      .on('error', err => reject(err))
      .pipe(file)
    file.on('finish', () => {
      file.close()
      resolve()
    })

    file.on('error', err => {
      fs.unlink(dest)
      reject(err)
    })
  })


module.exports = {
  copy,
  rceditSync,
  asarSync,
  compiler,
  download
}
