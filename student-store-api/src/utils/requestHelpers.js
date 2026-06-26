function firstQueryValue(value) {
  if (Array.isArray(value)) return value[0]
  if (typeof value === 'object' && value !== null) return undefined
  return value
}

function parseIntId(raw, res) {
  const id = Number(raw)
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'id must be an integer' })
    return null
  }
  return id
}

module.exports = { firstQueryValue, parseIntId }
