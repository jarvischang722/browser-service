const uuidV4 = require('uuid/v4')
const crypto = require('../utils/crypto')
const errors = require('../error')
const strUtils = require('../utils/str.js')

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
        const queryBrowser = `
            SELECT *
            FROM browser
            WHERE userid = ?
            ;`
        const resultsBrowser = await db.query(queryBrowser, [user.id])
        if (resultsBrowser.length > 0) {
            user.browsers = resultsBrowser.map(b => ({
                platform: b.platform,
                link: b.link,
                version: b.version,
                currentVersion: config.browser.version,
            }))
        }
    }
    return user
}

module.exports = {
    // signup,
    login,
}
