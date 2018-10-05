const errors = require('../error')


const getList = async (page, pagesize) => {
  const queryCnt = `
  SELECT COUNT(id) AS cnt
  FROM user
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
      SELECT u.id as userid , u.name, bwl.black_list, bwl.white_list 
      FROM user u 
      LEFT JOIN black_white_list bwl on bwl.userid = u.id
      ORDER BY  u.id ASC
      LIMIT ?
      OFFSET ?
      ;`
  list.items = await db.query(query, [pagesize, (page - 1) * pagesize])
  return list
}

const getDetail = async userid => {
  let list = {}
  const query = `
      SELECT u.id as userid , u.name, bwl.black_list, bwl.white_list 
      FROM user u 
      LEFT JOIN black_white_list bwl on bwl.userid = u.id
      WHERE u.id = ?
    ;`
  const results = await db.query(query, [Number(userid)])
  if (results.length > 0) list = results[0]

  return list
}

const update = async req => {
  const { userid, blackList, whiteList } = req.body
  const query = `
    INSERT INTO black_white_list(userid, black_list, white_list)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY 
    UPDATE  white_list = ? , white_list = ?
  ;`
  const results = await db.query(query, [userid, blackList, whiteList, blackList, whiteList])

  if (results.affectedRows <= 0) throw new errors.UserNotFoundError()
  const row = await getDetail(userid)
  return row
}

module.exports = {
  getList,
  getDetail,
  update
}