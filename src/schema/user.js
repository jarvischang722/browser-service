const mysql = require('mysql')
const uuidV4 = require('uuid/v4')
const crypto = require('../utils/crypto')
const datetime = require('../utils/datetime')
const STATUS_NORMAL = 1;
const STATUS_DISABLED = 2;

const authorize = (userName, password, key, callback) => {
    const conn = mysql.createConnection(connStr)
    const query = `
        SELECT playerId AS id, password
        FROM player
        WHERE username = ?
        ;`
    conn.query(query, [userName], function (err, results) {
        // TODO: 现在情况是用原始密码加密和php的结果不同, 但用db里的值解密, 可以得到和原始密码相同的值
        // 所以现在暂时使用原始密码是否相等来判断, 之后需改进加密算法, 来判断加密后的密码是否相同
        conn.end()
        if (err) return callback(err)
        const player = results[0]
        if (!player) return callback()
        const pwd = crypto.decrypt(player.password, key)
        if (password === pwd) return callback(null, player)
        return callback(401)
    })
}

const generateToken = (playerId, timeout, callback) => {
    const conn = mysql.createConnection(connStr)
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