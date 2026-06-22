const prisma = require('../db/db')

const ORDER_INCLUDE = { orderItems: { include: { product: true } } }

class NotFoundError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NotFoundError'
    this.status = 404
  }
}

class BadRequestError extends Error {
  constructor(message) {
    super(message)
    this.name = 'BadRequestError'
    this.status = 400
  }
}

class Order {
  static findAll({ customerEmail } = {}) {
    const where = customerEmail ? { customerEmail } : undefined
    return prisma.order.findMany({ where, orderBy: { createdAt: 'desc' } })
  }

  static findById(id) {
    return prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE })
  }

  static update(id, data) {
    return prisma.order.update({ where: { id }, data })
  }

  static remove(id) {
    return prisma.order.delete({ where: { id } })
  }

  static async createWithItems({ customer, customerEmail, status, items }) {
    if (!Number.isInteger(customer)) {
      throw new BadRequestError('customer must be an integer')
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestError('items must be a non-empty array')
    }
    for (const item of items) {
      if (!Number.isInteger(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1) {
        throw new BadRequestError('each item needs an integer productId and a positive integer quantity')
      }
    }

    const merged = new Map()
    for (const item of items) {
      merged.set(item.productId, (merged.get(item.productId) ?? 0) + item.quantity)
    }
    const mergedItems = [...merged.entries()].map(([productId, quantity]) => ({ productId, quantity }))

    return prisma.$transaction(async (tx) => {
      const productIds = mergedItems.map((i) => i.productId)
      const products = await tx.product.findMany({ where: { id: { in: productIds } } })

      if (products.length !== productIds.length) {
        const foundIds = new Set(products.map((p) => p.id))
        const missing = productIds.find((id) => !foundIds.has(id))
        throw new NotFoundError(`product ${missing} not found`)
      }

      const priceMap = new Map(products.map((p) => [p.id, p.price]))
      const totalPrice = mergedItems.reduce(
        (sum, i) => sum + priceMap.get(i.productId) * i.quantity,
        0,
      )

      return tx.order.create({
        data: {
          customer,
          customerEmail: customerEmail ?? null,
          status: status ?? 'pending',
          totalPrice,
          orderItems: {
            create: mergedItems.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              price: priceMap.get(i.productId),
            })),
          },
        },
        include: ORDER_INCLUDE,
      })
    })
  }

  static async addItem(orderId, { productId, quantity }) {
    if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) {
      throw new BadRequestError('productId and positive integer quantity are required')
    }

    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } })
      if (!order) throw new NotFoundError(`order ${orderId} not found`)

      const product = await tx.product.findUnique({ where: { id: productId } })
      if (!product) throw new NotFoundError(`product ${productId} not found`)

      await tx.orderItem.create({
        data: { orderId, productId, quantity, price: product.price },
      })

      const items = await tx.orderItem.findMany({ where: { orderId } })
      const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

      return tx.order.update({
        where: { id: orderId },
        data: { totalPrice },
        include: ORDER_INCLUDE,
      })
    })
  }
}

module.exports = Order
module.exports.NotFoundError = NotFoundError
module.exports.BadRequestError = BadRequestError
