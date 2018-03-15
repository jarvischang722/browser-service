const errors = require('../error')

const getLong = async (q) => {
  const l = { long: '' }
  if (!q) return l
  const query = `
    SELECT *
    FROM short
    WHERE short = ?
    ;`
  const results = await db.query(query, [q])
  if (results.length <= 0) return l
  const row = results[0]
  return {
    long: row.long,
    site_name: row.site_name,
    logo_url: row.logo_url,
  }
}

const getList = async (page, pagesize) => {
  const queryCnt = `
    SELECT COUNT(id) AS cnt
    FROM short
    ;`
  const resultsCnt = await db.query(queryCnt)
  if (resultsCnt.length <= 0 || resultsCnt[0].cnt <= 0) {
    return {
      total: 0,
    }
  }
  const list = {
    total: resultsCnt[0].cnt,
    items: [],
  }
  const query = `
    SELECT *
    FROM short
    ORDER BY id DESC
    LIMIT ?
    OFFSET ?
    ;`
  const results = await db.query(query, [pagesize, (page - 1) * pagesize])
  for (const row of results) {
    list.items.push({
      id: row.id,
      short: row.short,
      long: row.long,
      site_name: row.site_name,
      logo_url: row.logo_url,
    })
  }
  return list
}

const getDetail = async (id) => {
  const query = `
    SELECT *
    FROM short
    WHERE id = ?
    ;`
  const results = await db.query(query, [id])
  if (results.length <= 0) throw new errors.ShortItemNotFoundError()
  const row = results[0]
  return {
    id,
    short: row.short,
    long: row.long,
    site_name: row.site_name,
    logo_url: row.logo_url,
  }
}

const addShort = async (req) => {
  const { short, long, site_name } = req.body
  let logoPath = null
  if (req.file && req.file.path) {
    logoPath = req.file.path
  }
  const query = `
    INSERT short (short, \`long\`, site_name, logo_url)
    VALUES (?, ?, ?, ?)
    ;`
  const results = await db.query(query, [
    short, long, site_name, logoPath,
  ])
  if (!results.insertId) throw new errors.AddShortItemFailedError()
  return {
    id: results.insertId,
    short,
    long,
    site_name,
    logo_url: logoPath,
  }
}

const updateShort = async (req) => {
  const { id, short, long, site_name, logo_url } = req.body
  let logoPath = null
  if (req.file && req.file.path) {
    // 优先判断req.file里是否有值
    logoPath = req.file.path
  } else if (logo_url) {
    // 如果没有上传新的图标, 但之前上傳過icon, 把icon路徑作爲body内容傳入
    logoPath = logo_url
  }
  const query = `
    UPDATE short
    SET
      short = ?,
      \`long\` = ?,
      site_name = ?,
      logo_url = ?
    WHERE
      id = ?
    ;`
  const results = await db.query(query, [
    short, long, site_name, logoPath, id,
  ])
  if (results.affectedRows <= 0) throw new errors.ShortItemNotFoundError()
  return {
    id,
    short,
    long,
    site_name,
    logo_url: logoPath,
  }
}

module.exports = {
  getLong,
  getList,
  getDetail,
  addShort,
  updateShort,
}
