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

module.exports = {
  getVersion,
}
