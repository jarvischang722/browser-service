const uuidV4 = require('uuid/v4')
const crypto = require('../utils/crypto')
const errors = require('../error')
const strUtils = require('../utils/str.js')
const Browser = require('./browser')
const fs = require('fs')
const path = require('path')
const utils = require('../utils')

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

const checkPermission = (userId, tarId, results) => {
    if (results.length <= 0) return null
    const row = results[0]
    if (tarId !== userId && row.parent && row.parent !== userId) {
        // 如果目标用户不是自己 &
        // 如果目标用户的上级存在 &
        // 如果目标用户的上级不是自己
        return null
    }
    return row
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
    const row = checkPermission(userId, tarId, results)
    if (!row) throw new errors.UserNotFoundError()
    const browsers = await Browser.getUserBrowsers(tarId, config)
    // get homeurls
    const queryUrl = `
        SELECT url
        FROM homeurl
        WHERE userid = ?
        ;`
    const resultsUrl = await db.query(queryUrl, [tarId])
    const homeUrl = resultsUrl.map(r => r.url)
    const user = {
        id: row.id,
        username: row.username,
        name: row.name,
        expireIn: row.expire_in,
        icon: row.icon,
        browsers,
        homeUrl,
    }
    return user
}

const updateProfile = async (userId, req) => {
    return db.transaction(async (client) => {
        const { id, name } = req.body
        let { homeUrl } = req.body
        if (!Array.isArray(homeUrl)) homeUrl = [homeUrl]
        const tarId = id || userId
        const queryCheck = `
            SELECT *
            FROM user
            WHERE
                id = ?
            ;`
        const resultsCheck = await client.query(queryCheck, [tarId])
        const row = checkPermission(userId, tarId, resultsCheck)
        if (!row) throw new errors.UserNotFoundError()
        let iconPath = null
        if (req.file && req.file.path) {
            iconPath = `icon/${row.username}.ico`
            await utils.copy(req.file.path, path.join(__dirname, '../..', 'icon', `${row.username}.ico`))
        }
        // upload icon
        const query = `
            UPDATE user
            SET
                name = ?,
                icon = ?
            WHERE
                id = ?
            ;`
        const results = await client.query(query, [name, iconPath, tarId])
        if (results.affectedRows <= 0) throw new errors.UserNotFoundError()
        // update homeurl
        const queryClean = `
            DELETE FROM homeurl
            WHERE userid = ?;
        ;`
        await client.query(queryClean, [tarId])
        const queryAddUrl = `
            INSERT INTO homeurl (userid, url)
            VALUES (?, ?)
            ;`
        for (const url of homeUrl) {
            await client.query(queryAddUrl, [tarId, url])
        }
    })
}

module.exports = {
    login,
    getProfile,
    updateProfile,
    // updateExpireIn,
}
