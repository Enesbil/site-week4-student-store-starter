const express = require('express')
const OrderItem = require('../models/orderItem')

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const items = await OrderItem.findAll()
    res.json(items)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'id must be an integer' })
    const item = await OrderItem.findById(id)
    if (!item) return res.status(404).json({ error: `order item ${id} not found` })
    res.json(item)
  } catch (err) {
    next(err)
  }
})

module.exports = router
