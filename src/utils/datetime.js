require('date-utils')

const format = (dt, diff) => {
    if (!dt) {
        dt = new Date()
    } else {
        dt = new Date(dt)
    }
    if (!diff) diff = 0
    return new Date(dt.addSeconds(diff)).toFormat('YYYY-MM-DD HH24:MI:SS')
}

module.exports = { format }
