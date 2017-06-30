const getVersion = async (platform, client) => {
    const query = `
        SELECT *
        FROM browser
        WHERE
            platform = ?
            AND client = ?
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

const updateBrowser = async (platform, client, link, updateVersion) => {
    const defaultVersion = '2.9.0'
    const query = updateVersion ? `
        INSERT INTO browser (platform, client, version, link) 
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY 
        UPDATE
            version = CONCAT(SUBSTRING_INDEX(version, '.', 2), '.', (CONVERT(SUBSTRING_INDEX(version, '.', -1), UNSIGNED INTEGER) + 1)),
            link = ?
        ;` : `
        INSERT INTO browser (platform, client, version, link) 
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY 
        UPDATE
            link = ?
        ;`
    await db.query(query, [platform, client, defaultVersion, link, link])
}

const getUserBrowsers = async (userId, config) => {
    const query = `
        SELECT *
        FROM browser
        WHERE userid = ?
        ;`
    const results = await db.query(query, [userId])
    let browsers = []
    if (results.length > 0) {
        browsers = results.map(b => ({
            platform: b.platform,
            link: b.link,
            version: b.version,
            currentVersion: config.browser.version,
        }))
    }
    return browsers
}

module.exports = {
    getVersion,
    updateBrowser,
    getUserBrowsers,
}
