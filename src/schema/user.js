const uuidV4 = require('uuid/v4')
const crypto = require('../utils/crypto')
const datetime = require('../utils/datetime')
const STATUS_NORMAL = 1;
const STATUS_DISABLED = 2;

const authorize = (userName, password, key, callback) => {
    const hashedPwd = crypto.encrypt(password, key)
    const query = `
        SELECT playerId AS id
        FROM player
        WHERE
            username = ?
            AND password = ?
        ;`
    conn.query(query, [userName, hashedPwd], function (err, results) {
        conn.end()
        return callback(err, results[0])
    })
}

const generateToken = (playerId, timeout, callback) => {
    const token = uuidV4()
    const query = `
        INSERT INTO common_tokens (
            player_id, token, created_at, updated_at, timeout_at, timeout, status
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?
        );
    ;`
    const now = datetime.format()
    const timeoutAt = datetime.format(now, timeout)
    conn.query(query, [
        playerId,
        token,
        now,
        now,
        timeoutAt,
        timeout,
        STATUS_NORMAL,
    ], (err) => {
        conn.end()
        return callback(err, token)
    })
}

module.exports = {
    authorize,
    generateToken,
}