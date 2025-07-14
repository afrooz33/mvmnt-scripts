function toBoolean(value) {
  if (typeof value === 'string') {
    value = value.toLowerCase().trim()
    if (value === 'true' || value === '1') {
      return true
    } else if (value === 'false' || value === '0') {
      return false
    }
  } else if (typeof value === 'number') {
    return value === 1
  }
  return Boolean(value)
}

export { toBoolean }
