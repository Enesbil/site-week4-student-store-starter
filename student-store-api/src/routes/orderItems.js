const express = require('express')
const orderItems = require('../controllers/orderItems')

const router = express.Router()

router.get('/', orderItems.list)
router.get('/:id', orderItems.get)

module.exports = router
