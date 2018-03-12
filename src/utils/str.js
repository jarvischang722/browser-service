const random = (len) => {
  len = len || 8
  let text = ''
  const raw = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (const i of Array.from(Array(len).keys())) {
    text += raw.charAt(Math.floor(Math.random() * raw.length))
  }

  return text
}

module.exports = {
  random,
}
