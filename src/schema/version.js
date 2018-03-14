const Browser = require('./browser')

const getVersion = async (platform, client) => {
  const query = `
    SELECT *
    FROM
      browser AS a,
      user AS b
    WHERE
      a.userid = b.id
      AND a.platform = ?
      AND b.username = ?
    LIMIT 1
    ;`
  const results = await db.query(query, [platform, client])
  if (results.length <= 0) return {}
  const row = results[0]
  return {
    version: row.version,
    link: row.link,
  }
}

const updateBrowserInfo = async (userId, platform, link, version) => {
  const query = `
    INSERT INTO browser (userid, platform, version, link, status) 
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY 
    UPDATE
      version = ?,
      link = ?,
      status = ?
    ;`
  const status = Browser.STATUS.VALID
  await db.query(query, [userId, platform, version, link, status, version, link, status])
}

const getBrowserList = async (userId) => {
  const query = `
    SELECT *
    FROM browser
    WHERE userid = ?
    ;`
  const results = await db.query(query, [userId])
  if (results.length <= 0) {
    return {
      total: 0,
    }
  }
  const items = results.map(r => ({
    platform: r.platform,
    status: r.status,
    link: r.link,
    version: r.version,
  }))
  return {
    total: items.length,
    items,
  }
}

module.exports = {
  getVersion,
  updateBrowserInfo,
  getBrowserList,
}
