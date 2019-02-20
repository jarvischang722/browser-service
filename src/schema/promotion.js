const CONST = require('./const')

const list = async userid => {
  const query = `
        SELECT u.username, u.name, p.sort
        FROM user u 
        LEFT join promotion p  on u.id = p.userid
        WHERE parent = ? and status = ?
        ORDER BY p.sort, u.id
    ;`
  let results = await db.query(query, [userid, CONST.USER_STATUS.ACTIVE])
  results = results.map(d => ({
    username: d.username,
    name: d.name,
    sort: d.sort || 1
  }))
  return results
}

const updateSort = async agentList => {
  await db.transaction(async client => {
    for (const agent of agentList) {
      const { userid, sort } = agent
      const query = `
        INSERT INTO promotion(userid, sort)
        VALUES (?, ?)
        ON DUPLICATE KEY 
        UPDATE  userid = ? , sort = ?   
      ;`
      await client.query(query, [userid, sort, userid, sort])
    }
  })
  return true
}

module.exports = {
  updateSort,
  list
}
