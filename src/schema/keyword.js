const errors = require('../error')
const User = require('./user')

const getList = async (userid, page, pagesize) => {
  const userList = await User.getChildren(userid, page, pagesize)
  const userIds = userList.items.map(u => u.id).sort((a, b) => a - b)
  const query = `
      SELECT k.id, k.userid, k.keyword
      FROM  keyword k 
      WHERE k.userid in (?)
  ;`
  const keywords = await db.query(query, [userIds])
  const groupKw = keywords.reduce((acc, item) => {
    const key = item.userid
    acc[key] = acc[key] || []
    acc[key].push(item)
    return acc
  }, {})
  for (let i = 0; i < Object.keys(groupKw).length; i++) {
    const theUserId = Number(Object.keys(groupKw)[i])
    const idx = userList.items.findIndex(element => element.id === theUserId)
    userList.items[idx].keywords = groupKw[theUserId]
  }
  return userList
}

const update = async req => {
  const { userid, keyword } = req.body
  const query = `
      INSERT INTO keyword(userid, keyword)
      VALUES (? , ?)
      ON DUPLICATE KEY 
      UPDATE userid = ? , keyword = ?
  ;`
  const results = await db.query(query, [userid, keyword, userid, keyword])

  if (results.affectedRows <= 0) throw new errors.PlayerNotFoundError()

  return results
}

const deleteKeywords = async keywordList => {
  const query = `
      DELETE FROM keyword
      WHERE id in (?)
  ;`
  const results = await db.query(query, [keywordList])

  if (results.affectedRows <= 0) throw new errors.PlayerNotFoundError()

  return results
}

module.exports = {
  getList,
  update,
  deleteKeywords
}
