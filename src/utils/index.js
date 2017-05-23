const ncp = require('ncp').ncp
const rcedit = require('rcedit')
const asar = require('asar')
const innoSetup = require('innosetup-compiler')

const copy = (src, dest, options) => {
    return new Promise((resolve, reject) => {
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
    })
}

const rceditSync = (exePath, options) => {
    return new Promise((resolve, reject) => {
        rcedit(exePath, options, (err) => {
            if (err) return reject(err)
            return resolve()
        })
    })
}

const asarSync = (src, dest) => {
    return new Promise((resolve, reject) => {
        asar.createPackage(src, dest, (err) => {
            if (err) return reject(err)
            return resolve()
        })
    })
}

const compiler = (iss, options) => {
    return new Promise((resolve, reject) => {
        innoSetup(iss, options, (err) => {
            if (err) return reject(err)
            return resolve()
        })
    })
}

module.exports = {
    copy,
    rceditSync,
    asarSync,
    compiler,
}