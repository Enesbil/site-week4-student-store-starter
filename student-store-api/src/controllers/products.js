const Product = require('../models/product')
const { firstQueryValue, parseIntId } = require('../utils/requestHelpers')

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

async function list(req, res, next) {
  try {
    const products = await Product.findAll({
      category: firstQueryValue(req.query.category),
      sort: firstQueryValue(req.query.sort),
    })
    res.json(products)
  } catch (err) {
    next(err)
  }
}

async function get(req, res, next) {
  try {
    const id = parseIntId(req.params.id, res)
    if (id === null) return
    const product = await Product.findById(id)
    if (!product) return res.status(404).json({ error: `product ${id} not found` })
    res.json(product)
  } catch (err) {
    next(err)
  }
}

async function create(req, res, next) {
  try {
    const { data, error } = pickProductFields(req.body || {}, { requireAll: true })
    if (error) return res.status(400).json({ error })
    const product = await Product.create(data)
    res.status(201).json(product)
  } catch (err) {
    next(err)
  }
}

async function update(req, res, next) {
  try {
    const id = parseIntId(req.params.id, res)
    if (id === null) return
    const { data, error } = pickProductFields(req.body || {}, { requireAll: false })
    if (error) return res.status(400).json({ error })
    const product = await Product.update(id, data)
    res.json(product)
  } catch (err) {
    next(err)
  }
}

async function remove(req, res, next) {
  try {
    const id = parseIntId(req.params.id, res)
    if (id === null) return
    await Product.remove(id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
}

module.exports = { list, get, create, update, remove }
