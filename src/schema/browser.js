
const url = require('url')
const fs = require('fs')
const path = require('path')
const utils = require('../utils')
const uuidV4 = require('uuid/v4')
const builder = require('electron-builder')
const mv = require('mv')

const STATUS = {
  VALID: 1,
  CREATING: 2,
  FAILED: 3,
}

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

const updateCreatingBrowserStatus = async (userId, platform, status) => {
  status = status || STATUS.CREATING
  const query = `
    INSERT INTO browser (userid, platform, status) 
    VALUES (?, ?, ?)
    ON DUPLICATE KEY 
    UPDATE
      status = ?
    ;`
  await db.query(query, [userId, platform, status, status])
}

const updateBrowser = async (userId, platform, link, version) => {
  const query = `
    INSERT INTO browser (userid, platform, version, link, status) 
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY 
    UPDATE
      version = ?,
      link = ?,
      status = ?
    ;`
  await db.query(query, [userId, platform, version, link, STATUS.VALID, version, link, STATUS.VALID])
}

// 先只支持windows版本
const getUserBrowser = async (userId, config) => {
  const query = `
    SELECT *
    FROM browser
    WHERE 
      userid = ?
      AND platform = ?
    ;`
  const results = await db.query(query, [userId, 'windows'])
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

const getLocalPort = async (userId, username) => {
  const query = `
    SELECT port
    FROM port
    WHERE client = ?
  ;`
  const results = await db.query(query, [username])
  if (results.length > 0) return results[0].port
  const queryMax = `
    SELECT MAX(port) AS port
    FROM port
    ;`
  const resultsMax = await db.query(queryMax)
  const localPort = resultsMax.length > 0 ? resultsMax[0].port + 1 : 22870
  const querySave = `
    INSERT INTO port (userid, client, port) 
    VALUES (?, ?, ?)
  ;`
  await db.query(querySave, [userId, username, localPort])
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
});
`
  return pac
}

const createBrowser = async (config, profile) => {
  const { id, username, name, homeUrl, icon } = profile

  const rmpath = path.join(__dirname, '../..', 'deploy')
  try {
    const { projectPath, version, legalCopyright } = config.browser
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
      enabledProxy: true,
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
    const iconFile = path.join(optionPath, 'icon.ico')
    // const rceditOptions = {
    //   'version-string': {
    //     CompanyName: options.companyName,
    //     FileDescription: options.fileDescription,
    //     LegalCopyright: legalCopyright || 'Copyright 2017',
    //     ProductName: options.productName,
    //   },
    //   'file-version': version,
    //   'product-version': version,
    //   icon: iconFile,
    // }
    // await utils.copy(path.join(projectPath, 'dist/unpacked/electron.exe'), path.join(projectPath, 'dist/unpacked/safety-browser.exe'), { clobber: false })
    // await utils.rceditSync(path.join(projectPath, 'dist/unpacked/safety-browser.exe'), rceditOptions)

    // await utils.copy(optionFile, path.join(projectPath, 'src/app/config/client.json'))
    // await utils.copy(iconFile, path.join(projectPath, 'src/app/config/icon.ico'))
    // await utils.copy(path.join(projectPath, 'src/plugins'), path.join(projectPath, 'dist/unpacked/plugins'))

    // await utils.asarSync(path.join(projectPath, 'src/app'), path.join(projectPath, 'dist/unpacked/resources/app.asar'))
    // const setupFileName = `safety-browser-${options.client}-setup`
    // await utils.compiler(path.join(projectPath, 'build/install-script/smartbrowser.iss'), {
    //   gui: false,
    //   verbose: true,
    //   signtool: 'tripleonesign=$p',
    //   O: path.join(__dirname, '../..', 'deploy'),
    //   F: setupFileName,
    //   DProjectHomeBase: projectPath,
    //   DCLIENT: options.client,
    //   DCLIENT_GUID: `{${options.clientId}}`,
    //   DAPP_VERSION: version,
    //   DAPP_TITLE_EN: options.productNameEn,
    //   DAPP_TITLE_CH: options.productName,
    //   DAPP_ICO: iconFile,
    // })
    // const link = `/download/${setupFileName}.exe`
    // // update version if needed
    // await updateBrowser(id, 'windows', link, version)
    // return link
    const setupFileName = `safety-browser-${username}-setup.exe`
    await utils.copy(optionFile, path.join(projectPath, 'src/app/config/client.json'))
    await utils.copy(iconFile, path.join(projectPath, 'src/app/config/icon.ico'))
    builder.build({
      extraMetadata: {
        name: `${name}`,
        description: `${name}`,
        author: 'TripleOneTech',
      },
      config: {
        appId: uuidV4().toUpperCase(),
        buildVersion: version,
        copyright: '',
        directories: {
          app: `${projectPath}/src/app/`,
          output: `${projectPath}/dist/client/`,
        },
        win: {
          target: ['nsis'],
          icon: iconFile,
          certificateFile: `${projectPath}/build/install-script/smartbrowser.pfx`,
          certificatePassword: '12345678',
          extraResources: `${projectPath}/src/plugins/*.dll`,
          artifactName: setupFileName,
        },
        nsis: {
          oneClick: false,
          perMachine: true,
          installerIcon: iconFile,
          installerHeaderIcon: iconFile,
          uninstallerIcon: iconFile,
        },
        extraFiles: [{
          from: `${projectPath}/src/plugins`,
          to: 'resources/src/plugins',
          filter: ['**/*'],
        }],
      },
    })
    .then(() => {
      const link = `/download/${setupFileName}`
      // update version if needed
      updateBrowser(id, 'windows', link, version)
      fs.unlinkSync(`${projectPath}/dist/client/${setupFileName}.blockmap`)
      mv(`${projectPath}/dist/client/${setupFileName}`, `${rmpath}/${setupFileName}`, (err) => {
        if (err) return err
        console.log('FILE TRANSFER SUCCESSFUL')
        return link
      })
    })
    .catch((error) => {
      console.log(error)
    })
  } catch (err) {
    await updateCreatingBrowserStatus(id, 'windows', STATUS.FAILED)
  }
}

const getBrowserInfo = async (userId, tarId, config) => {
  const User = require('./user')
  const targeId = tarId || userId
  await User.checkPermission(userId, targeId)
  const browser = await getUserBrowser(targeId, config)
  return browser
}

const getLong = (str) => {
  let result = { long: '' }
  switch (str) {
    case 't1t':
    case 'tot':
      result = {
        long: 'www.tripleonetech.net',
        site_name: '合众科技',
        logo_url: '',
      }
      break
    case 'apple':
      result = {
        long: 'www.apple.com',
        site_name: '苹果',
        logo_url: '',
      }
      break
    case 'lanhai':
      result = {
        long: 'www.lanhai.t1t.games',
        site_name: '',
        logo_url: '',
      }
      break
    case 'xc':
      result = {
        long: 'm.xc33.com',
        site_name: '新橙',
        logo_url: 'http://52.198.79.141/download/icon/xc.png',
      }
      break
    case 'youhu':
      result = {
        long: 'm.youhu.t1t.games',
        site_name: '游虎娱乐',
        logo_url: 'http://52.198.79.141/download/icon/youhu.png',
      }
      break
    case 'macaopj':
      result = {
        long: 'm.p9601.com',
        site_name: '澳门葡京',
        logo_url: 'http://52.198.79.141/download/icon/macaopj.png',
      }
      break
    case 'xpj':
      result = {
        long: 'm.xpj.t1t.games',
        site_name: '新葡京',
        logo_url: 'http://52.198.79.141/download/icon/xpj.png',
      }
      break
    case 'lebo':
      result = {
        long: 'm.lbbet888.com',
        site_name: '乐博',
        logo_url: 'http://52.198.79.141/download/icon/lebo.png',
      }
      break
    case 'lequ':
      result = {
        long: 'm.lequ.t1t.games',
        site_name: '乐趣时时彩',
        logo_url: 'http://52.198.79.141/download/icon/lequ.png',
      }
      break
    case 'dlcity':
      result = {
        long: 'm.dlcity.t1t.games',
        site_name: '电乐城',
        logo_url: 'http://52.198.79.141/download/icon/dlcity.png',
      }
      break
    default:
      break
  }
  return result
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
  createBrowser,
  getUserBrowser,
  getBrowserInfo,
  updateCreatingBrowserStatus,
  getLong,
  getBrowserList,
  updateBrowser,
}
