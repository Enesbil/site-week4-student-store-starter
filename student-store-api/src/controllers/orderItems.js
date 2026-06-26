const OrderItem = require('../models/orderItem')
const { parseIntId } = require('../utils/requestHelpers')

async function list(req, res, next) {
  try {
    const items = await OrderItem.findAll()
    res.json(items)
  } catch (err) {
    next(err)
  }
}

async function get(req, res, next) {
  try {
    const id = parseIntId(req.params.id, res)
    if (id === null) return
    const item = await OrderItem.findById(id)
    if (!item) return res.status(404).json({ error: `order item ${id} not found` })
    res.json(item)
  } catch (err) {
    next(err)
  }
}

module.exports = { list, get }
