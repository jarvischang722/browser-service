const crypto = require('../utils/crypto')
const errors = require('../error')
const strUtils = require('../utils/str.js')
const Browser = require('./browser')
const path = require('path')
const utils = require('../utils')

// userId 是自己的
// 其他信息是下级代理的
const createUser = async (userId, body) => {
    const { username, password, name, expireIn, role } = body
    const queryProfile = `
        SELECT expire_in
        FROM user
        WHERE id = ?
        ;`
    const resultsProfile = await db.query(queryProfile, [userId])
    if (resultsProfile.length <= 0) throw new errors.UserNotFoundError()
    const myExpireIn = resultsProfile[0].expire_in
    if (myExpireIn && myExpireIn < expireIn) throw new errors.InvalidExpireInError()
    const salt = strUtils.random()
    const query = `
        INSERT INTO user (
            username, salt, password, name, role, expire_in, parent
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ;`
    const hashedPwd = crypto.encrypt(password, salt)
    const results = await db.query(query, [username, salt, hashedPwd, name, role, expireIn, userId])
    const newUserId = results.insertId
    if (!newUserId) throw new errors.CreateUserFailedError()
    return {
        id: newUserId,
        username,
        password,
    }
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

const getHomeUrl = async (userId) => {
    const queryUrl = `
        SELECT url
        FROM homeurl
        WHERE userid = ?
        ;`
    const resultsUrl = await db.query(queryUrl, [userId])
    const homeUrl = resultsUrl.map(r => r.url)
    return homeUrl
}

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
        role: row.role,
        username: row.username,
        name: row.name,
        expireIn: row.expire_in,
        icon: row.icon,
    }
    if (user) {
        // get client browser
        user.browser = await Browser.getUserBrowser(user.id, config)
        user.homeUrl = await getHomeUrl(user.id)
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
    const row = checkPermission(userId, tarId, results)
    if (!row) throw new errors.UserNotFoundError()
    const browser = await Browser.getUserBrowser(tarId, config)
    // get homeurls
    const homeUrl = await getHomeUrl(tarId)
    const user = {
        id: row.id,
        role: row.role,
        username: row.username,
        name: row.name,
        expireIn: row.expire_in,
        icon: row.icon,
        browser,
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
    createUser,
    // updateExpireIn,
}
