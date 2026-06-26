const express = require('express')
const orders = require('../controllers/orders')

const router = express.Router()

router.get('/', orders.list)
router.get('/:id', orders.get)
router.post('/', orders.create)
router.put('/:id', orders.update)
router.delete('/:id', orders.remove)
router.post('/:id/items', orders.addItem)

module.exports = router
