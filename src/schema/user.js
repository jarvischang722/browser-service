
const uuidV4 = require('uuid/v4')
const db = require('../utils/db')
const crypto = require('../utils/crypto')
const datetime = require('../utils/datetime')

const STATUS = {
    NORMAL: 1,
    DISABLED: 2,
}

const signup = async (userName, email, password, key) => {
    // TODO: check needed columns from registration fields table
    // const queryFields = 'SELECT * FROM registration_fields WHERE type = 1;'
    // const resultFields = await db.exec(queryFields)
    // if (resultFields && resultFields.length > 0) {
    //     const rowFields = resultFields[0]
    // }
    const query = `
        INSERT INTO player (
            username, email, password, verify, withdraw_password, withdraw_password_md5
        )
        VALUES (?, ?, ?, false, '', '')
        ;`
    const hashedPwd = crypto.encrypt(password, key)
    await db.exec(query, [userName, email, hashedPwd])
}

const authorize = async (userName, password, key) => {
    const query = `
        SELECT playerId AS id
        FROM player
        WHERE 
            username = ?
            AND password = ?
        ;`
    const hashedPwd = crypto.encrypt(password, key)
    const results = await db.exec(query, [userName, hashedPwd])
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
    await db.exec(query, [
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

module.exports = {
    signup,
    authorize,
    generateToken,
}
