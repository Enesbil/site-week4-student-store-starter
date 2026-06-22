const prisma = require('../db/db')

const SORTABLE_FIELDS = new Set(['price', 'name'])

class Product {
  static findAll({ category, sort } = {}) {
    const where = category ? { category } : undefined
    const orderBy = SORTABLE_FIELDS.has(sort) ? { [sort]: 'asc' } : { id: 'asc' }
    return prisma.product.findMany({ where, orderBy })
  }

  static findById(id) {
    return prisma.product.findUnique({ where: { id } })
  }

  static create(data) {
    return prisma.product.create({ data })
  }

  static update(id, data) {
    return prisma.product.update({ where: { id }, data })
  }

  static remove(id) {
    return prisma.product.delete({ where: { id } })
  }
}

module.exports = Product
