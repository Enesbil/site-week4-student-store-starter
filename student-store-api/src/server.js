require('dotenv').config()

const express = require('express')
const cors = require('cors')

const productsRouter = require('./routes/products')
const ordersRouter = require('./routes/orders')
const orderItemsRouter = require('./routes/orderItems')
const errorHandler = require('./middleware/errorHandler')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ name: 'student-store-api', status: 'ok' })
})

app.use('/products', productsRouter)
app.use('/orders', ordersRouter)
app.use('/order-items', orderItemsRouter)

app.use((req, res) => {
  res.status(404).json({ error: 'not found' })
})

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`student-store-api listening on http://localhost:${PORT}`)
})
