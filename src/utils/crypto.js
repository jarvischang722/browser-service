
const crypto = require('crypto');
const algorithm = 'des-ecb'

const encrypt = (input, key) => {
	const cipher = crypto.createCipheriv(algorithm, key, '');
	const output = cipher.update(input, 'utf8', 'base64');
	return output
}

const decrypt = (input, key) => {
	const decipher = crypto.createDecipheriv(algorithm, key, '')
	let output = decipher.update(input, 'base64', 'utf8')
	return output
}

module.exports = {
    encrypt, 
    decrypt,
}
