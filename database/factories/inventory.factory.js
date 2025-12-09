// database/factories/inventory.factory.js
const { defineFactory } = require('./baseFactory');

/**
 * Inventory Factory
 * @param {Object} db - Database object with models
 * @returns {Object} Factory instance
 */
const InventoryFactory = (db) => {
  return defineFactory(db.Inventory, (faker) => {
    const units = ['ml', 'L', 'g', 'kg', 'units'];
    const statuses = ['available', 'low', 'out of stock', 'ordered'];
    const ports = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    
    return {
      name: faker.commerce.productName(),
      quantity: faker.number.int({ min: 0, max: 10000 }),
      dispensePort: faker.helpers.arrayElement(ports),
      unit: faker.helpers.arrayElement(units),
      status: faker.helpers.arrayElement(statuses),
      updateDate: faker.date.recent({ days: 30 })
      // userId will be set in seeder from created users
    };
  });
};

module.exports = InventoryFactory;
