const uuidV4 = require('uuid/v4')
const crypto = require('../utils/crypto')
const errors = require('../error')
const strUtils = require('../utils/str.js')
const Browser = require('./browser')

// // userId 是自己的
// // 其他信息是下级代理的
// // TODO
// const createUser = async (userId, userName, password, role, expire_in) => {
//     return db.transaction(async (client) => {
//         const salt = strUtils.random()
//         const query = `
//             INSERT INTO player (
//                 username, salt, password
//             )
//             VALUES (?, ?, ?, ?, '-')
//             ;`
//         password = crypto.encrypt(password, salt)
//         payPassword = crypto.encrypt(payPassword, salt)
//         const results = await client.query(query, [userName, salt, password, payPassword])
//         const playerId = results.insertId
//         if (!playerId) return new errors.CreatePlayerFailedError()

//         return {
//             id: playerId,
//         }
//     })
// }

const login = async (userName, password, config) => {
    const query = `
        SELECT *
        FROM user
        WHERE username = ?
        ;`
    const results = await db.query(query, [userName])
    if (results.length <= 0) return null
    const row = results[0]
    const hashedPwd = row.salt ? crypto.encrypt(password, row.salt) : password
    const user = hashedPwd !== row.password ? null : {
        id: row.id,
        username: row.username,
        name: row.name,
        expireIn: row.expire_in,
    }
    if (user) {
        // get client browsers
        user.browsers = await Browser.getUserBrowsers(user.id, config)
    }
    return user
}

const getProfile = async (userId, tarId, config) => {
    tarId = tarId || userId
    const query = `
        SELECT *
        FROM user
        WHERE
            id = ?
        ;`
    const results = await db.query(query, [tarId])
    if (results.length <= 0) throw new errors.UserNotFoundError()
    const row = results[0]
    if (tarId !== userId && row.parent && row.parent !== userId) {
        // 如果目标用户不是自己 &
        // 如果目标用户的上级存在 &
        // 如果目标用户的上级不是自己
        throw new errors.UserNotFoundError()
    }
    const browsers = await Browser.getUserBrowsers(tarId, config)
    return {
        id: row.id,
        username: row.username,
        name: row.name,
        expireIn: row.expire_in,
        browsers,
    }
}

module.exports = {
    // signup,
    login,
    getProfile,
}
