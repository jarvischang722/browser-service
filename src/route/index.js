const exempt = require('../authorization/exemptions').add
const fs = require('fs')

const bind = (route, config) => {
  fs.readdirSync(__dirname).forEach(file => {
    if (file !== 'index.js') {
      require(`./${file}`)(route, config, exempt)
    }
  })
  route.get('/', (req, res) => {
    res.send('Tripleonetech browser api service 2.0')
  })
}
/**
 * @apiDefine UnauthorizedError
 * @apiError UnauthorizedError Not login
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 404 Not Found
   * {
      "error": {
          "code": "UnauthorizedError",
          "message": "身份验证失败，请重新登录"
      }
   * }
 *
 */

/**
 * @apiDefine HeaderInfo
 * @apiHeader {String} Content-Type
 * @apiHeader {String} X-Auth-Key   登陆之后返回的auth token
 *
 *  @apiHeaderExample {json} Header-Example:
 * {
 *    "Content-Type": "application/json",
 *    "X-Auth-Key": "eyJhbGci..."
 * }
 *
 * 說明
 *   1. 如果没有传id, 则获取自己的profile
 *   2. 如果传了id, 会判断自己是否是目标用户的上级, 如果不是, 则抛UserNotFoundError
 *
 *
 */

exempt('/')
exempt('/pub_plugins')

module.exports = { bind }
