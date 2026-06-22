const express = require('express')
const Order = require('../models/order')

const router = express.Router()

function firstQueryValue(value) {
  if (Array.isArray(value)) return value[0]
  if (typeof value === 'object' && value !== null) return undefined
  return value
}

router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.findAll({ customerEmail: firstQueryValue(req.query.customerEmail) })
    res.json(orders)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'id must be an integer' })
    const order = await Order.findById(id)
    if (!order) return res.status(404).json({ error: `order ${id} not found` })
    res.json(order)
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const order = await Order.createWithItems(req.body || {})
    res.status(201).json(order)
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'id must be an integer' })
    const body = req.body || {}
    const allowed = new Set(['status', 'customerEmail'])
    for (const key of Object.keys(body)) {
      if (!allowed.has(key)) {
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
})

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'id must be an integer' })
    await Order.remove(id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

router.post('/:id/items', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'id must be an integer' })
    const order = await Order.addItem(id, req.body || {})
    res.status(201).json(order)
  } catch (err) {
    next(err)
  }
})

module.exports = router
