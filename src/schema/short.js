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

module.exports = {
  getLong,
}
