const net = require('net')

/**
 * Use net's socket module to check if ss server is working.
 * @param {Object} ssConf : shadowsocks's configuration
 */
const checkSSIsAvail = async (ssConf, config) => new Promise((resolve, reject) => {
  try {
    const socket = new net.Socket()
    if (config.timeout) socket.setTimeout(config.timeout)
    else socket.setTimeout(3000)

    socket.connect(ssConf.serverPort, ssConf.serverAddr, () => {
      socket.destroy()
      resolve(ssConf)
    })
    socket.on('timeout', () => {
      socket.destroy()
      resolve(false)
    })
    socket.on('error', (err) => {
      resolve(false)
    })
  } catch (ex) {
    throw ex
  }
})


module.exports = { checkSSIsAvail }
