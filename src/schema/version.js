const errors = require('../error')

const getLink = (link, platform, host) => {
  if (!host || !link) return link
  if (platform !== 'Windows') return link
  if (link.includes('http')) return link
  if (!host.includes('http')) return link
  const lk = link[0] === '/' ? link.slice(1) : link
  return `${host}/${lk}`
}

const getVersion = async (platform, client, host) => {
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
    link: getLink(row.link, platform, host),
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
  const Browser = require('./browser')
  const status = Browser.STATUS.VALID
  await db.query(query, [userId, platform, version, link, status, version, link, status])
}

const getBrowserList = async (userId, host) => {
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
    id: r.id,
    platform: r.platform,
    status: r.status,
    link: getLink(r.link, r.platform, host),
    version: r.version,
    error_msg: r.error_msg
  }))
  return {
    total: items.length,
    items,
  }
}

const getBrowserDetail = async (userId, id, host) => {
  const User = require('./user')
  const query = `
    SELECT *
    FROM browser
    WHERE id = ?
    ;`
  const results = await db.query(query, [id])
  if (results.length <= 0) throw new errors.BrowserInfoNotFoundError()
  const row = results[0]
  await User.checkPermission(userId, row.userid)
  const info = {
    id,
    platform: row.platform,
    status: row.status,
    link: getLink(row.link, row.platform, host),
    version: row.version,
  }
  return info
}

module.exports = {
  getVersion,
  updateBrowserInfo,
  getBrowserList,
  getBrowserDetail,
}
