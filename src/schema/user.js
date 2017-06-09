const uuidV4 = require('uuid/v4')
const crypto = require('../utils/crypto')
const datetime = require('../utils/datetime')

const STATUS = {
    NORMAL: 1,
    DISABLED: 2,
}

const signup = async (userName, email, password, key) => {
    const query = `
        INSERT INTO player (
            username, email, password, verify
        )
        VALUES (?, ?, ?, false)
        ;`
    const hashedPwd = crypto.encrypt(password, key)
    const results = await db.query(query, [userName, email, hashedPwd])
    return {
        id: results.insertId,
    }
}

const login = async (userName, password, key) => {
    const query = `
        SELECT id
        FROM player
        WHERE 
            username = ?
            AND password = ?
        ;`
    const hashedPwd = crypto.encrypt(password, key)
    const results = await db.query(query, [userName, hashedPwd])
    return results[0]
}

const generateToken = async (playerId, timeout) => {
    const token = uuidV4()
    const query = `
        INSERT INTO common_tokens (
            player_id, token, created_at, updated_at, timeout_at, timeout, status
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?
        );`
    const now = datetime.format()
    const timeoutAt = datetime.format(now, timeout)
    await db.query(query, [
        playerId,
        token,
        now,
        now,
        timeoutAt,
        timeout,
        STATUS.NORMAL,
    ])
    return token
}

const testTrans = async () => {
    const a = await db.transaction(async (client) => {
        await client.query('SELECT 1;')
        await client.query('SELECT 2;')
    })
    return a
}

module.exports = {
    signup,
    login,
    generateToken,
    testTrans,
}
