const ADMIN_ID = 1

const ROLE = {
  ADMIN: 0,
  AGENT: 1,
  CLIENT: 2
}

const BUILD_STATUS = {
  VALID: 1,
  CREATING: 2,
  FAILED: 3
}

const USER_STATUS = {
  ACTIVE: 1,
  DISABLE: 0
}

const PLATFORM_OS = {
  WIN: 'Windows',
  MAC: 'macOS'
}

module.exports = {
  ADMIN_ID,
  ROLE,
  BUILD_STATUS,
  USER_STATUS,
  PLATFORM_OS
}
