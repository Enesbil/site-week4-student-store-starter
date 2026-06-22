function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err)

  if (err && err.code === 'P2025') {
    return res.status(404).json({ error: 'not found' })
  }

  const status = err.status || 500
  const message = status === 500 ? 'internal server error' : err.message
  if (status === 500) console.error(err)
  res.status(status).json({ error: message })
}

module.exports = errorHandler
