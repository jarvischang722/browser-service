const mysql = require('mysql')
const mysqlPromise = require('promise-mysql')

const query = (execQuery, params) => {
    const promise = (resolve, reject) => {
        let conn
        try {
            conn = mysql.createConnection(connStr)
            params = params || []
            conn.query(execQuery, params, (err, results) => {
                if (err) return reject(err)
                return resolve(results)
            })
        } catch (err) {
            return reject(err)
        } finally {
            if (conn) conn.end()
        }
    }
    return new Promise(promise)
}

const transaction = async (actions) => {
    let conn
    try {
        conn = await mysqlPromise.createConnection(connStr)
        await conn.beginTransaction()
        const results = await actions(conn)
        await conn.commit()
        return results
    } catch (err) {
        await conn.rollback()
    } finally {
        if (conn) await conn.end()
    }
}

module.exports = { query, transaction }
