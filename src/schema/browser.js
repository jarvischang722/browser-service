require('date-utils')
const url = require('url')
const fs = require('fs')
const path = require('path')
const utils = require('../utils')
const uuidV4 = require('uuid/v4')
const Version = require('./version')
const { BUILD_STATUS: STATUS, PLATFORM_OS } = require('./const')

const updateCreatingBrowserStatus = async (userId, platform, status, errorMsg) => {
  const st = status || STATUS.CREATING
  let error_msg = status === 3 && errorMsg ? errorMsg : null
  if (userId === undefined || platform === undefined) {
    return
  }
  if (typeof error_msg === 'string') {
    error_msg = error_msg.substring(0, 255)
  }
  const query = `
    INSERT INTO browser (userid, platform, status) 
    VALUES (?, ?, ?)
    ON DUPLICATE KEY 
    UPDATE
      status = ?, error_msg = ?
    ;`
  await db.query(query, [userId, platform, st, st, error_msg])
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
  const results = await db.query(query, [userId, platform || PLATFORM_OS.WIN])
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

const getLocalPort = async (userId, username, platform) => {
  if (platform === 'macOS') {
    // 因為MACOS的SS APPLICATION(ShadowsocksX-NG.app)無法更換任何設定，所以只能寫死某個PORT
    return 22870
  }
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
    const iconTailPath = platform === PLATFORM_OS.WIN ? icon : icon_macos
    const iconFileName = platform === PLATFORM_OS.WIN ? 'icon.ico' : 'icon.png'
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

    const localPort = await getLocalPort(id, username, platform)
    const ssServerList = config.ssServerList || []
    const ssProxyOption =
      ssServerList.length > 0 ? ssServerList[Math.floor(Math.random() * ssServerList.length)] : {}
    // generate options
    const options = {
      client: username,
      homeUrl,
      companyName: name,
      productName: `${name}`,
      productNameEn: `${username.toUpperCase()}`,
      fileDescription: `${name}安全浏览器`,
      enabledFlash: true,
      enabledProxy: true,
      clientId: uuidV4().toUpperCase(),
      proxyOptions: Object.assign({}, ssProxyOption, {
        localAddr: '127.0.0.1',
        localPort,
        timeout: 180000
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
    await utils.copy(optionFile, path.join(projectPath, 'src/app/config/client.json'))
    await utils.copy(path.join(optionPath, iconFileName), path.join(projectPath, 'src/app/config/'))
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
    const errorMsg = err.message || JSON.stringify('err')
    await updateCreatingBrowserStatus(id, platform, STATUS.FAILED, errorMsg)
  }
}

const getBrowserInfo = async (userId, tarId, config, platform) => {
  const User = require('./user')
  const targeId = tarId || userId
  await User.checkPermission(userId, targeId)
  const browser = await getUserBrowser(targeId, config, platform)
  return browser
}

const getConfig = () => {
  // TODO 之后需要将设定档改为动态捞取， 2019/01/28
  const configs = {
    isVPNEnable: false
  }
  return configs
}

const getClientData = async (config, clientName) => {
  const User = require('./user')
  const clientId = await User.getClientId(clientName)
  const clientInfo = await User.getProfile(clientId, clientId, config)
  const homeUrl = await User.getHomeUrlByClientName(clientName)
  const ssDomain = clientInfo.ss_domain || []
  const ssServerList = config.ssServerList || []
  const enabledProxy = clientInfo.enable_vpn === 1 || false
  return {
    client: clientName,
    homeUrl,
    ssDomain,
    enabledProxy,
    ssServerList
  }
}

module.exports = {
  STATUS,
  createBrowser,
  getUserBrowser,
  getBrowserInfo,
  updateCreatingBrowserStatus,
  getConfig,
  getClientData
}
