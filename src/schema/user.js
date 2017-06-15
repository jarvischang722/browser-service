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
    if (key) password = crypto.encrypt(password, key)
    const results = await db.query(query, [userName, email, password])
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

// if binded, return
// if not binded, create new one and bind
const getBindedPlayer = async (thirdParty, userId) => {
    const query = `
        SELECT a.playerid AS id, b.username
        FROM 
            player_mapping AS a,
            player AS b
        WHERE
            a.playerid = b.id
            AND third_party = ?
            AND third_party_id = ?
        ;`
    const results = await db.query(query, [thirdParty, userId])
    if (results.length > 0) return results[0]
    const player = await signup('', '', uuidV4())
    const queryBind = `
        INSERT INTO player_mapping (playerid, third_party, third_party_id)
        VALUES (?, ?, ?)
        ;`
    await db.query(queryBind, [player.id, thirdParty, userId])
    return player
}

const getBindedUser = async (thirdParty, playerId) => {
    const query = `
        SELECT a.third_party_id AS id
        FROM 
            player_mapping AS a,
            player AS b
        WHERE
            a.playerid = b.id
            AND a.third_party = ?
            AND b.id = ?
        ;`
    const results = await db.query(query, [thirdParty, playerId])
    return results[0]
}

const bindUser = async (thirdParty, playerId, userId) => {
    const query = `
        INSERT INTO player_mapping (playerid, third_party, third_party_id)
        VALUES (?, ?, ?)
        ;`
    await db.query(query, [playerId, thirdParty, userId])
}

module.exports = {
    signup,
    login,
    generateToken,
    getBindedPlayer,
    getBindedUser,
    bindUser,
}
