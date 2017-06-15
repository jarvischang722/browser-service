const uuidV4 = require('uuid/v4')
const crypto = require('../utils/crypto')

const signup = async (userName, email, password, key) => {
    const query = `
        INSERT INTO user (
            username, email, password
        )
        VALUES (?, ?, ?)
        ;`
    if (key) password = crypto.encrypt(password, key)
    const results = await db.query(query, [userName, email, password])
    return {
        id: results.insertId,
    }
}

const login = async (userName, password, key) => {
    const query = `
        SELECT id
        FROM user
        WHERE 
            username = ?
            AND password = ?
        ;`
    const hashedPwd = crypto.encrypt(password, key)
    const results = await db.query(query, [userName, hashedPwd])
    return results[0]
}

// get user center user by merchant player
// if binded, return
// if not binded, create new one and bind
const getBindedUser = async (merchant, playerId) => {
    const query = `
        SELECT a.id, a.username
        FROM
            user AS a,
            user_mapping AS b
        WHERE
            a.id = b.userid
            AND b.merchant = ?
            AND b.playerid = ?
        ;`
    const results = await db.query(query, [merchant, playerId])
    if (results.length > 0) return results[0]
    const user = await signup('', '', uuidV4())
    const queryBind = `
        INSERT INTO user_mapping (userid, merchant, playerid)
        VALUES (?, ?, ?)
        ;`
    await db.query(queryBind, [user.id, merchant, playerId])
    return user
}

// get merchant player by user center user
const getBindedPlayer = async (merchant, userId) => {
    const query = `
        SELECT playerid AS id
        FROM user_mapping
        WHERE 
            merchant = ?
            AND userid = ?
        ;`
    const results = await db.query(query, [merchant, userId])
    return results[0]
}

const bindPlayer = async (merchant, userId, playerId) => {
    const query = `
        INSERT INTO user_mapping (userid, merchant, playerid)
        VALUES (?, ?, ?)
        ;`
    await db.query(query, [userId, merchant, playerId])
}

module.exports = {
    signup,
    login,
    getBindedUser,
    getBindedPlayer,
    bindPlayer,
}
