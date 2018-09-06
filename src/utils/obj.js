const pick = (obj, ...props) => {
  if (typeof obj !== 'object') {
    throw new Error('First parameter is not an object')
  }
  const pickedObj = {}
  for (const [key, value] of Object.entries(obj)) {
    if (props.includes(key)) {
      pickedObj[key] = value
    }
  }
  return pickedObj
}

module.exports = {
  pick
}
