const express = require('express')
const products = require('../controllers/products')

const router = express.Router()

router.get('/', products.list)
router.get('/:id', products.get)
router.post('/', products.create)
router.put('/:id', products.update)
router.delete('/:id', products.remove)

module.exports = router
