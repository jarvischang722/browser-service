const crypto = require('crypto')

const algorithm = 'des-ecb'

const encrypt = (input, key) => {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), Buffer.alloc(0))
  let output = cipher.update(input, 'utf8', 'base64')
  output += cipher.final('base64')
  return output
}

const decrypt = (input, key) => {
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), Buffer.alloc(0))
  let output = decipher.update(input, 'base64', 'utf8')
  output += decipher.final('utf8')
  return output
}

module.exports = {
  encrypt,
  decrypt,
}
