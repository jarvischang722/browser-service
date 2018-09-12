require('date-utils')
const url = require('url')
const fs = require('fs')
const path = require('path')
const utils = require('../utils')
const uuidV4 = require('uuid/v4')
const Version = require('./version')

const STATUS = {
  VALID: 1,
  CREATING: 2,
  FAILED: 3
}

const updateCreatingBrowserStatus = async (userId, platform, status) => {
  const st = status || STATUS.CREATING
  const query = `
    INSERT INTO browser (userid, platform, status) 
    VALUES (?, ?, ?)
    ON DUPLICATE KEY 
    UPDATE
      status = ?
    ;`
  await db.query(query, [userId, platform, st, st])
}

// Only support Windows and Mac
const getUserBrowser = async (userId, config, platform) => {
  const query = `
    SELECT *
    FROM browser
    WHERE 
      userid = ?
      AND platform = ?
    ;`
  const results = await db.query(query, [userId, platform || 'Windows'])
  let browser = null
  if (results.length > 0) {
    const row = results[0]
    browser = {
      status: row.status,
      link: row.link,
      version: {
        local: row.version,
        server: config.browser.version
      }
    }
  }
  return browser
}

const getLocalPort = async userId => {
  const query = `
    SELECT port
    FROM port
    WHERE userid = ?
  ;`
  const results = await db.query(query, [userId])
  if (results.length > 0) return results[0].port
  const queryMax = `
    SELECT MAX(port) AS port
    FROM port
    ;`
  const resultsMax = await db.query(queryMax)
  const localPort = resultsMax.length > 0 ? resultsMax[0].port + 1 : 22870
  const querySave = `
    INSERT INTO port (userid, port) 
    VALUES (?, ?)
  ;`
  await db.query(querySave, [userId, localPort])
  return localPort
}

const getPacContent = async (homeUrl, localPort) => {
  // write pac file
  let filterString = ''
  for (const page of homeUrl) {
    const pageUrl = url.parse(page)
    let host = pageUrl.host || pageUrl.path
    const idx = host.lastIndexOf('.')
    const suffix = host.slice(idx + 1)
    if (idx > -1) {
      host = host.slice(0, idx)
      const main = host.slice(host.lastIndexOf('.') + 1)
      filterString += `
  if (/(?:^|\\.)${main}\\.${suffix}$/gi.test(host)) return "+proxy";`
    } else {
      filterString += `
  if (/(?:^|\\.)${suffix}$/gi.test(host)) return "+proxy";`
    }
  }
  const pac = `var FindProxyForURL = function(init, profiles) {
return function(url, host) {
  "use strict";
  var result = init, scheme = url.substr(0, url.indexOf(":"));
  do {
    result = profiles[result];
    if (typeof result === "function") result = result(url, host, scheme);
  } while (typeof result !== "string" || result.charCodeAt(0) === 43);
  return result;
};
}("+safe", {
"+safe": function(url, host, scheme) {
  "use strict";${filterString}
  return "DIRECT";
},
"+proxy": function(url, host, scheme) {
  "use strict";
  return "SOCKS5 127.0.0.1:${localPort}; SOCKS 127.0.0.1:${localPort}; DIRECT;";
}
});`
  return pac
}

const createBrowser = async (config, profile, platform) => {
  const { id, username, name, homeUrl, icon, icon_macos } = profile
  try {
    const iconTailPath = platform === 'Windows' ? icon : icon_macos
    const iconFileName = platform === 'Windows' ? 'icon.ico' : 'icon.png'
    const { projectPath, version: ver } = config.browser
    const buildNum = new Date().toFormat('MMDDHH24MI')
    const version = `${ver}.${buildNum}`
    const optionPath = path.join(projectPath, `src/clients/${username}`)
    if (!fs.existsSync(optionPath)) fs.mkdirSync(optionPath)
    // copy icon to client folder
    const iconPath = path.join(__dirname, '../..', iconTailPath)
    if (fs.existsSync(iconPath)) {
      await utils.copy(iconPath, path.join(optionPath, iconFileName))
    } else {
      utils.download(
        `${config.server.mainAddr}/${iconTailPath}`,
        path.join(optionPath, iconFileName)
      )
    }

    const localPort = await getLocalPort(id, username)
    const ssServerList = config.ssServerList || []
    // generate options
    const options = {
      client: username,
      homeUrl,
      companyName: name,
      productName: `${name}安全浏览器`,
      productNameEn: `${username.toUpperCase()} Safety Browser`,
      fileDescription: `${name}安全浏览器`,
      enabledFlash: true,
      enabledProxy: true,
      clientId: uuidV4().toUpperCase(),
      proxyOptions: Object.assign({}, ssServerList.length > 0 ? ssServerList[0] : {}, {
        localAddr: '127.0.0.1',
        localPort,
        timeout: 180
      }),
      ssServerList
    }
    const pac = await getPacContent(homeUrl, localPort)
    const pacFile = path.join(optionPath, 'default.pac')
    fs.writeFileSync(pacFile, pac)
    await utils.copy(pacFile, path.join(projectPath, 'src/app/config/default.pac'))
    // generate option file
    const optionFile = path.join(optionPath, 'client.json')
    fs.writeFileSync(optionFile, JSON.stringify(options, null, 4))
    const iconFile = path.join(optionPath, 'icon.ico')
    await utils.copy(optionFile, path.join(projectPath, 'src/app/config/client.json'))
    await utils.copy(iconFile, path.join(projectPath, 'src/app/config/icon.ico'))
    await utils.asarSync(
      path.join(projectPath, 'src/app'),
      path.join(projectPath, 'dist/unpacked/resources/app.asar')
    )
    const setupFileName = await utils.compiler(options, projectPath)
    const link = `${config.server.hostname}/download/${setupFileName}`
    // update version if needed
    await Version.updateBrowserInfo(id, platform, link, version)
    return link
  } catch (err) {
    await updateCreatingBrowserStatus(id, platform, STATUS.FAILED)
  }
}

const getBrowserInfo = async (userId, tarId, config, platform) => {
  const User = require('./user')
  const targeId = tarId || userId
  await User.checkPermission(userId, targeId)
  const browser = await getUserBrowser(targeId, config, platform)
  return browser
}

module.exports = {
  STATUS,
  createBrowser,
  getUserBrowser,
  getBrowserInfo,
  updateCreatingBrowserStatus
}
