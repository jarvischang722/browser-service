const mysql = require('mysql')

const exec = (query, params) => {
    return new Promise((resolve, reject) => {
        let conn
        try {
            conn = mysql.createConnection(connStr)
            params = params || []
            conn.query(query, params, (err, results) => {
                if (err) return reject(err)
                return resolve(results)
            })
        } catch (err) {
            throw err
        } finally {
            if (conn) conn.end()
        }
    })
}

module.exports = { exec }