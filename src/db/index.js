const mysql = require('mysql')
const mysqlPromise = require('promise-mysql')
const DbManager = require('./manager')

let connections

const query = (execQuery, params) => {
    const promise = (resolve, reject) => {
        let conn
        try {
            conn = mysql.createConnection(connections)
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
        conn = await mysqlPromise.createConnection(connections)
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

const configure = (config) => {
    const dbCfg = config.database.mysql
    connections = {
        host: dbCfg.host,
        port: dbCfg.port,
        database: dbCfg.db,
        user: dbCfg.credentials.username,
        password: dbCfg.credentials.password,
        multipleStatements: true,
    }
    return new DbManager({ connections })
}

module.exports = { configure, query, transaction }
