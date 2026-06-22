const express = require('express')
const Product = require('../models/product')

const router = express.Router()

function firstQueryValue(value) {
  if (Array.isArray(value)) return value[0]
  if (typeof value === 'object' && value !== null) return undefined
  return value
}

router.get('/', async (req, res, next) => {
  try {
    const products = await Product.findAll({
      category: firstQueryValue(req.query.category),
      sort: firstQueryValue(req.query.sort),
    })
    res.json(products)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'id must be an integer' })
    const product = await Product.findById(id)
    if (!product) return res.status(404).json({ error: `product ${id} not found` })
    res.json(product)
  } catch (err) {
    next(err)
  }
})

const PRODUCT_STRING_FIELDS = ['name', 'description', 'imageUrl', 'category']

function pickProductFields(body, { requireAll }) {
  const data = {}
  for (const field of PRODUCT_STRING_FIELDS) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== 'string' || body[field] === '') {
        return { error: `${field} must be a non-empty string` }
      }
      data[field] = body[field]
    } else if (requireAll) {
      return { error: `${field} is required` }
    }
  }
  if (body.price !== undefined) {
    if (typeof body.price !== 'number' || Number.isNaN(body.price)) {
      return { error: 'price must be a number' }
    }
    data.price = body.price
  } else if (requireAll) {
    return { error: 'price is required' }
  }
  return { data }
}

router.post('/', async (req, res, next) => {
  try {
    const { data, error } = pickProductFields(req.body || {}, { requireAll: true })
    if (error) return res.status(400).json({ error })
    const product = await Product.create(data)
    res.status(201).json(product)
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'id must be an integer' })
    const { data, error } = pickProductFields(req.body || {}, { requireAll: false })
    if (error) return res.status(400).json({ error })
    const product = await Product.update(id, data)
    res.json(product)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'id must be an integer' })
    await Product.remove(id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

module.exports = router
