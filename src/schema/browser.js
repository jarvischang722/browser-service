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
  FAILED: 3,
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

// 先只支持Windows版本
const getUserBrowser = async (userId, config) => {
  const query = `
    SELECT *
    FROM browser
    WHERE 
      userid = ?
      AND platform = ?
    ;`
  const results = await db.query(query, [userId, 'Windows'])
  let browser = null
  if (results.length > 0) {
    const row = results[0]
    browser = {
      status: row.status,
      link: row.link,
      version: {
        local: row.version,
        server: config.browser.version,
      },
    }
  }
  return browser
}

const getLocalPort = async (userId) => {
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

const createBrowser = async (config, profile) => {
  const { id, username, name, homeUrl, icon } = profile
  try {
    const { projectPath, version, legalCopyright, pluginsDownloadUrl } = config.browser
    const optionPath = path.join(projectPath, `src/clients/${username}`)
    if (!fs.existsSync(optionPath)) fs.mkdirSync(optionPath)
      // copy icon to client folder
    await utils.copy(path.join(__dirname, '../..', icon), path.join(optionPath, 'icon.ico'))
    const localPort = await getLocalPort(id, username)
    // generate options
    const options = {
      client: username,
      homeUrl,
      companyName: name,
      productName: `${name}安全浏览器`,
      productNameEn: `${username.toUpperCase()} Safety Browser`,
      fileDescription: `${name}安全浏览器`,
      enabledFlash: true,
      enabledProxy: false,
      clientId: uuidV4().toUpperCase(),
      proxyOptions: {
        localAddr: '127.0.0.1',
        localPort,
        serverAddr: '52.198.79.141',
        serverPort: 19999,
        password: 'dBbQMP8Nd9vyjvN',
        method: 'aes-256-cfb',
        timeout: 180,
      },
    }
    const pac = await getPacContent(homeUrl, localPort)
    const pacFile = path.join(optionPath, 'default.pac')
    fs.writeFileSync(pacFile, pac)
    await utils.copy(pacFile, path.join(projectPath, 'src/app/config/default.pac'))
      // generate option file
    const optionFile = path.join(optionPath, 'client.json')
    fs.writeFileSync(optionFile, JSON.stringify(options, null, 4))
    let iconFile = path.join(optionPath, 'icon.ico')
    const rceditOptions = {
      'version-string': {
        CompanyName: options.companyName,
        FileDescription: options.fileDescription,
        LegalCopyright: legalCopyright || 'Copyright 2017',
        ProductName: options.productName,
      },
      'file-version': version,
      'product-version': version,
      icon: iconFile,
    }
    await utils.copy(path.join(projectPath, 'dist/unpacked/electron.exe'), path.join(projectPath, 'dist/unpacked/safety-browser.exe'), { clobber: false })
    await utils.rceditSync(path.join(projectPath, 'dist/unpacked/safety-browser.exe'), rceditOptions)
    await utils.copy(optionFile, path.join(projectPath, 'src/app/config/client.json'))
    await utils.copy(iconFile, path.join(projectPath, 'src/app/config/icon.ico'))
    await utils.asarSync(path.join(projectPath, 'src/app'), path.join(projectPath, 'dist/unpacked/resources/app.asar'))
    const setupFileName = `safety-browser-${options.client}-setup`
    let issFile = path.join(projectPath, 'build/install-script/smartbrowser.iss')
    let outputPath = path.join(__dirname, '../..', 'deploy')
    let pPath = null
    let pluginUrl = null
    if (!/^win/.test(process.platform)) {
      issFile = issFile.replace(/\//g, '\\')
      iconFile = iconFile.replace(/\//g, '\\')
      outputPath = outputPath.replace(/\//g, '\\')
      pPath = projectPath.replace(/\//g, '\\')
      pluginUrl = pluginsDownloadUrl.replace(/\//g, '\\')
    }
    const compilerOpt = {
      gui: false,
      verbose: true,
      signtool: 'tripleonesign=$p',
      O: outputPath,
      F: setupFileName,
      DProjectHomeBase: pPath || projectPath,
      DPluginsDownloadUrl: pluginUrl || pluginsDownloadUrl,
      DCLIENT: options.client,
      DCLIENT_GUID: `{${options.clientId}}`,
      DAPP_VERSION: version,
      DAPP_TITLE_EN: options.productNameEn,
      DAPP_TITLE_CH: options.productName,
      DAPP_ICO: iconFile,
    }
    await utils.compiler(issFile, compilerOpt)
    const link = `/download/${setupFileName}.exe`
      // update version if needed
    await Version.updateBrowserInfo(id, 'Windows', link, version)
    await updateCreatingBrowserStatus(id, 'Windows', STATUS.VALID)
    return link
  } catch (err) {
    await updateCreatingBrowserStatus(id, 'Windows', STATUS.FAILED)
  }
}

const getBrowserInfo = async (userId, tarId, config) => {
  const User = require('./user')
  const targeId = tarId || userId
  await User.checkPermission(userId, targeId)
  const browser = await getUserBrowser(targeId, config)
  return browser
}

module.exports = {
  STATUS,
  createBrowser,
  getUserBrowser,
  getBrowserInfo,
  updateCreatingBrowserStatus,
}
