const mysql = require('mysql')

const exec = (query, params) => {
    const promise = (resolve, reject) => {
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
    }
    return new Promise(promise)
}

module.exports = { exec }
