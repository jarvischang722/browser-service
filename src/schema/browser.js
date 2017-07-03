
const url = require('url')
const fs = require('fs')
const path = require('path')
const utils = require('../utils')
const uuidV4 = require('uuid/v4')

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

const createBrowser = async (config, profile) => {
    const { username, name, homeUrl, icon } = profile
    const { projectPath, version, legalCopyright } = config.browser
    const optionPath = path.join(projectPath, `src/clients/${username}`)
    if (!fs.existsSync(optionPath)) fs.mkdirSync(optionPath)
    // copy icon to client folder
    await utils.copy(path.join(__dirname, '../..', icon), path.join(optionPath, 'icon.ico'))
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
    }
    // get available local port
    const localPortFile = path.join(__dirname, '..', 'meta/local-port.json')
    const currentLocalPort = require(localPortFile)
    let localPort
    if (currentLocalPort[username]) {
        localPort = currentLocalPort[username]
    } else {
        localPort = Math.max(...Object.values(currentLocalPort)) + 1
        currentLocalPort[username] = localPort
        fs.writeFileSync(localPortFile, JSON.stringify(currentLocalPort, null, 4))
    }
    options.proxyOptions = {
        localAddr: '127.0.0.1',
        localPort,
        serverAddr: '106.75.147.144',
        serverPort: 17777,
        password: 'dBbQMP8Nd9vyjvN',
        method: 'aes-256-cfb',
        timeout: 180,
    }
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
    const pacFile = path.join(optionPath, 'default.pac')
    fs.writeFileSync(pacFile, pac)
    await utils.copy(pacFile, path.join(projectPath, 'src/app/config/default.pac'))
    // generate option file
    const optionFile = path.join(optionPath, 'client.json')
    fs.writeFileSync(optionFile, JSON.stringify(options, null, 4))
    const iconFile = path.join(optionPath, 'icon.ico')
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
    await utils.copy(path.join(projectPath, 'src/plugins'), path.join(projectPath, 'dist/unpacked/plugins'))

    await utils.asarSync(path.join(projectPath, 'src/app'), path.join(projectPath, 'dist/unpacked/resources/app.asar'))
    const setupFileName = `safety-browser-${options.client}-setup-${version}`
    await utils.compiler(path.join(projectPath, 'build/install-script/smartbrowser.iss'), {
        gui: false,
        verbose: true,
        signtool: 'tripleonesign=$p',
        O: path.join(__dirname, '../..', 'deploy'),
        F: setupFileName,
        DProjectHomeBase: projectPath,
        DCLIENT: options.client,
        DCLIENT_GUID: `{${options.clientId}}`,
        DAPP_VERSION: version,
        DAPP_TITLE_EN: options.productNameEn,
        DAPP_TITLE_CH: options.productName,
        DAPP_ICO: iconFile,
    })
    return setupFileName
}

module.exports = {
    getVersion,
    createBrowser,
    updateBrowser,
    getUserBrowsers,
}
