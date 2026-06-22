const prisma = require('../db/db')

class OrderItem {
  static findAll() {
    return prisma.orderItem.findMany({
      include: { product: true, order: true },
      orderBy: { id: 'asc' },
    })
  }

  static findById(id) {
    return prisma.orderItem.findUnique({
      where: { id },
      include: { product: true, order: true },
    })
  }

  static create({ orderId, productId, quantity, price }) {
    return prisma.orderItem.create({
      data: { orderId, productId, quantity, price },
    })
  }
}

module.exports = OrderItem
