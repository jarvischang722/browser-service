const url = require('url')
const fs = require('fs')
const path = require('path')
const utils = require('./index')
const uuidV4 = require('uuid/v4')
const { validate, T } = require('../validator')

const SCHEMA = {
    homeUrl: T.array().items(T.string().uri()).required(),
}

const createBrowser = async (config, req) => {
    const { client, homepage, company } = req.body
    const homeUrl = [...new Set(homepage.split(/\r\n/))]
    validate({ homeUrl }, SCHEMA)
    console.log(homeUrl)
    console.log(Array.isArray(homeUrl))
    const useProxy = req.body.useProxy === 'on'
    const { projectPath, version, legalCopyright } = config.browser
    const optionPath = path.join(projectPath, `src/clients/${client}`)
    if (!fs.existsSync(optionPath)) fs.mkdirSync(optionPath)
    if (req.file && req.file.path) {
        utils.copy(req.file.path, path.join(optionPath, 'icon.ico'))
    }
    // generate options
    const options = {
        client,
        homeUrl,
        companyName: company,
        productName: `${company}安全浏览器`,
        productNameEn: `${client.toUpperCase()} Safety Browser`,
        fileDescription: `${company}安全浏览器`,
        legalCopyright,
        version,
        enabledFlash: true,
        enabledProxy: useProxy,
        clientId: uuidV4().toUpperCase(),
    }
    if (useProxy) {
        // get available local port
        const localPortFile = path.join(__dirname, '..', 'meta/local-port.json')
        const currentLocalPort = require(localPortFile)
        let localPort
        if (currentLocalPort[client]) {
            localPort = currentLocalPort[client]
        } else {
            localPort = Math.max(...Object.values(currentLocalPort)) + 1
            currentLocalPort[client] = localPort
            fs.writeFileSync(localPortFile, JSON.stringify(currentLocalPort, null, 4))
        }
        options.proxyOptions = {
            localAddr: '127.0.0.1',
            localPort,
            serverAddr: '106.75.147.144',
            serverPort: 19999,
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
    }
    // generate option file
    const optionFile = path.join(optionPath, 'client.json')
    fs.writeFileSync(optionFile, JSON.stringify(options, null, 4))
    const icon = path.join(optionPath, 'icon.ico')
    const rceditOptions = {
        'version-string': {
            CompanyName: options.companyName,
            FileDescription: options.fileDescription,
            LegalCopyright: options.legalCopyright || 'Copyright 2017',
            ProductName: options.productName,
        },
        'file-version': options.version,
        'product-version': options.version,
        icon,
    }
    await utils.copy(path.join(projectPath, 'dist/unpacked/electron.exe'), path.join(projectPath, 'dist/unpacked/safety-browser.exe'), { clobber: false })
    await utils.rceditSync(path.join(projectPath, 'dist/unpacked/safety-browser.exe'), rceditOptions)

    await utils.copy(optionFile, path.join(projectPath, 'src/app/config/client.json'))
    await utils.copy(icon, path.join(projectPath, 'src/app/config/icon.ico'))
    await utils.copy(path.join(projectPath, 'src/plugins'), path.join(projectPath, 'dist/unpacked/plugins'))

    await utils.asarSync(path.join(projectPath, 'src/app'), path.join(projectPath, 'dist/unpacked/resources/app.asar'))
    const setupFileName = `safety-browser-${options.client}-setup-${options.version}`
    await utils.compiler(path.join(projectPath, 'build/install-script/smartbrowser.iss'), {
        gui: false,
        verbose: true,
        signtool: 'tripleonesign=$p',
        O: path.join(__dirname, '../..', 'deploy'),
        F: setupFileName,
        DProjectHomeBase: projectPath,
        DCLIENT: options.client,
        DCLIENT_GUID: `{${options.clientId}}`,
        DAPP_VERSION: options.version,
        DAPP_TITLE_EN: options.productNameEn,
        DAPP_TITLE_CH: options.productName,
        DAPP_ICO: icon,
    })
    return setupFileName
}

module.exports = { createBrowser }
