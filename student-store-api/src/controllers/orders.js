const Order = require('../models/order')
const { firstQueryValue, parseIntId } = require('../utils/requestHelpers')

const UPDATABLE_FIELDS = new Set(['status', 'customerEmail'])

async function list(req, res, next) {
  try {
    const orders = await Order.findAll({ customerEmail: firstQueryValue(req.query.customerEmail) })
    res.json(orders)
  } catch (err) {
    next(err)
  }
}

async function get(req, res, next) {
  try {
    const id = parseIntId(req.params.id, res)
    if (id === null) return
    const order = await Order.findById(id)
    if (!order) return res.status(404).json({ error: `order ${id} not found` })
    res.json(order)
  } catch (err) {
    next(err)
  }
}

async function create(req, res, next) {
  try {
    const order = await Order.createWithItems(req.body || {})
    res.status(201).json(order)
  } catch (err) {
    next(err)
  }
}

async function update(req, res, next) {
  try {
    const id = parseIntId(req.params.id, res)
    if (id === null) return
    const body = req.body || {}
    for (const key of Object.keys(body)) {
      if (!UPDATABLE_FIELDS.has(key)) {
        return res.status(400).json({ error: `field "${key}" cannot be updated` })
      }
    }
    const data = {}
    if (body.status !== undefined) {
      if (typeof body.status !== 'string' || body.status === '') {
        return res.status(400).json({ error: 'status must be a non-empty string' })
      }
      data.status = body.status
    }
    if (body.customerEmail !== undefined) {
      if (body.customerEmail !== null && typeof body.customerEmail !== 'string') {
        return res.status(400).json({ error: 'customerEmail must be a string or null' })
      }
      data.customerEmail = body.customerEmail
    }
    const order = await Order.update(id, data)
    res.json(order)
  } catch (err) {
    next(err)
  }
}

async function remove(req, res, next) {
  try {
    const id = parseIntId(req.params.id, res)
    if (id === null) return
    await Order.remove(id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
}

async function addItem(req, res, next) {
  try {
    const id = parseIntId(req.params.id, res)
    if (id === null) return
    const order = await Order.addItem(id, req.body || {})
    res.status(201).json(order)
  } catch (err) {
    next(err)
  }
}

module.exports = { list, get, create, update, remove, addItem }
