const crypto = require('../utils/crypto')
const errors = require('../error')
const strUtils = require('../utils/str.js')
const Browser = require('./browser')
const { PLATFORM_OS } = require('./const')

const checkExpireTime = async (userId, expireIn) => {
  const query = `
    SELECT expire_in
    FROM user
    WHERE id = ?
    ;`
  const results = await db.query(query, [userId])
  if (results.length <= 0) throw new errors.UserNotFoundError()
  const myExpireIn = results[0].expire_in
  if (!myExpireIn) return
  if (!expireIn) throw new errors.ExpireInRequiredError()
  if (myExpireIn < expireIn) throw new errors.InvalidExpireInError()
}

// userId 是自己的
// 其他信息是下级代理的
const createUser = async (userId, body) => {
  const { username, name, expireIn, role } = body
  await checkExpireTime(userId, expireIn)
  const password = strUtils.random()
  const salt = strUtils.random()
  const query = `
    INSERT INTO user (
      username, salt, password, name, role, expire_in, parent
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ;`
  const hashedPwd = crypto.encrypt(password, salt)
  const results = await db.query(query, [username, salt, hashedPwd, name, role, expireIn, userId])
  const newUserId = results.insertId
  if (!newUserId) throw new errors.CreateUserFailedError()
  return {
    id: newUserId,
    username,
    password
  }
}

const checkPermission = async (userId, tarId) => {
  const query = `
    SELECT *
    FROM user
    WHERE id = ?
    ;`
  const results = await db.query(query, [tarId])
  if (results.length <= 0) throw new errors.UserNotFoundError()
  const row = results[0]
  if (tarId !== userId && row.parent && row.parent !== userId) {
    // 如果目标用户不是自己 &
    // 如果目标用户的上级存在 &
    // 如果目标用户的上级不是自己
    throw new errors.UserNotFoundError()
  }
  return row
}

const getHomeUrl = async userId => {
  const queryUrl = `
    SELECT url
    FROM homeurl
    WHERE userid = ?
    ;`
  const resultsUrl = await db.query(queryUrl, [userId])
  const homeUrl = resultsUrl.map(r => r.url)
  return homeUrl
}

/**
 * Take homurl with client.
 * @param {String} clientName : client'username
 */
const getHomeUrlByClientName = async clientName => {
  const queryUrl = `
    SELECT url
    FROM homeurl h
    INNER JOIN user u on u.id = h.userid
    WHERE u.username = ?
    ;`
  const resultsUrl = await db.query(queryUrl, [clientName])
  const homeUrls = resultsUrl.map(r => r.url)
  return homeUrls
}

const login = async (userName, password) => {
  const query = `
    SELECT *
    FROM user
    WHERE username = ?
    ;`
  const results = await db.query(query, [userName])
  if (results.length <= 0) return null
  const row = results[0]
  const hashedPwd = row.salt ? crypto.encrypt(password, row.salt) : password
  const user =
    hashedPwd !== row.password
      ? null
      : {
        id: row.id,
        role: row.role
      }
  return user
}

const getUser = async userId => {
  const query = `
    SELECT *
    FROM user
    WHERE id = ?
    ;`
  const results = await db.query(query, [userId])
  if (results.length <= 0) return null
  const row = results[0]
  const user = {
    id: row.id,
    role: row.role
  }
  return user
}

const getProfile = async (userId, tarId, config, platform) => {
  const clientPlatform = platform || PLATFORM_OS.WIN
  const targetId = tarId || userId
  const row = await checkPermission(userId, targetId)
  const browser = await Browser.getUserBrowser(targetId, config, clientPlatform)
  // get homeurls
  const homeUrl = await getHomeUrl(targetId)
  const user = {
    id: row.id,
    role: row.role,
    username: row.username,
    name: row.name,
    expireIn: row.expire_in,
    icon: row.icon,
    icon_macos: row.icon_macos,
    browser,
    homeUrl,
    enable_vpn: row.enable_vpn
  }
  return user
}

const updateProfile = async req =>
  db.transaction(async client => {
    const userId = req.user.id
    const { id, name, icon, icon_macos, enable_vpn } = req.body
    let { homeUrl } = req.body
    if (!Array.isArray(homeUrl)) homeUrl = [homeUrl]
    const tarId = id || userId
    await checkPermission(userId, tarId)
    let iconPath = null
    let iconMacOSPath = null
    if (req.files && Object.keys(req.files).length > 0) {
      // 优先判断req.files里是否有值, 有的话说明正在上传或更新图标
      iconPath = req.files.icon ? `${req.files.icon[0].path}` : icon
      iconMacOSPath = req.files.icon_macos ? `${req.files.icon_macos[0].path}` : icon_macos
    } else if (icon) {
      // 如果没有上传新的图标, 但之前上傳過icon, 把icon路徑作爲body内容傳入
      iconPath = icon
      iconMacOSPath = icon_macos
    }
    // upload icon
    const query = `
      UPDATE user
      SET
        name = ?,
        icon = ?,
        icon_macos = ?,
        enable_vpn = ?
      WHERE
        id = ?
      ;`
    const results = await client.query(query, [name, iconPath, iconMacOSPath, enable_vpn, tarId])
    if (results.affectedRows <= 0) throw new errors.UserNotFoundError()
    // update homeurl
    const queryClean = `
      DELETE FROM homeurl
      WHERE userid = ?;
    ;`
    await client.query(queryClean, [tarId])
    const queryAddUrl = `
      INSERT INTO homeurl (userid, url)
      VALUES (?, ?)
      ;`
    for (const url of homeUrl) {
      await client.query(queryAddUrl, [tarId, url])
    }
    const user = {
      id: tarId,
      name,
      homeUrl,
      icon: iconPath,
      icon_macos: iconMacOSPath,
      enable_vpn
    }
    return user
  })

const getChildren = async (userId, page, pagesize) => {
  const queryCount = `
    SELECT COUNT(id) AS cnt
    FROM user
    WHERE parent = ?
  ;`
  const resultsCount = await db.query(queryCount, [userId])
  if (resultsCount.length <= 0 || resultsCount[0].cnt <= 0) {
    return {
      total: 0
    }
  }
  const query = `
    SELECT *
    FROM user
    WHERE parent = ?
    ORDER BY id DESC
    LIMIT ?
    OFFSET ?
    ;`
  const results = await db.query(query, [userId, pagesize, (page - 1) * pagesize])
  const users = results.map(r => ({
    id: r.id,
    username: r.username,
    name: r.name,
    role: r.role,
    expireIn: r.expire_in
  }))
  return {
    total: resultsCount[0].cnt,
    items: users
  }
}

const changeChildExpireTime = async (userId, tarId, expireIn) => {
  if (userId === tarId) throw new errors.NoPermissionError()
  // 不需另外check permission 因为更新时的where条件有parent
  await checkExpireTime(userId, expireIn)
  const query = `
    UPDATE user
    SET expire_in = ?
    WHERE 
      id = ?
      AND parent = ?
    ;`
  const results = await db.query(query, [expireIn, tarId, userId])
  if (results.affectedRows <= 0) throw new errors.UserNotFoundError()
  return {
    id: tarId,
    expireIn
  }
}

module.exports = {
  login,
  getUser,
  getHomeUrlByClientName,
  getProfile,
  updateProfile,
  createUser,
  getChildren,
  changeChildExpireTime,
  checkPermission
}
