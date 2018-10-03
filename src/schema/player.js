const errors = require('../error')
const crypto = require('../utils/crypto')
const serverOpt = require('../config')

const getList = async (page, pagesize) => {
  const queryCnt = `
      SELECT COUNT(id) AS cnt
      FROM player_user
      ;`
  const resultsCnt = await db.query(queryCnt)
  if (resultsCnt.length <= 0 || resultsCnt[0].cnt <= 0) {
    return {
      total: 0
    }
  }
  const list = {
    total: resultsCnt[0].cnt,
    items: []
  }
  const query = `
      SELECT id, username, name, contact_number, email, gender, birthdate, status, disable_expire
      FROM player_user
      ORDER BY id DESC
      LIMIT ?
      OFFSET ?
      ;`
  const results = await db.query(query, [pagesize, (page - 1) * pagesize])
  list.items = results
  return list
}

const getDetail = async playerId => {
  let player = {}
  if (typeof playerId === 'number') {
    const query = `
        SELECT id, username, name, contact_number, email, gender, birthdate, status, disable_expire
        FROM player_user
        where id = ?
        ;`
    const results = await db.query(query, [playerId])
    if (results.length > 0) player = results[0]
  }
  return player
}

const updatePlayerSta = async req => {
  const { playerId, status, disableExpire } = req.body
  const query = `
  UPDATE player_user
  SET
    status = ?,
    disable_expire = ?
  WHERE
    id = ?
  ;`
  const results = await db.query(query, [status, disableExpire, playerId])

  if (results.affectedRows <= 0) throw new errors.PlayerNotFoundError()
  const row = await getDetail(playerId)
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    disable_expire: row.disable_expire
  }
}

module.exports = {
  getList,
  getDetail,
  updatePlayerSta
}
