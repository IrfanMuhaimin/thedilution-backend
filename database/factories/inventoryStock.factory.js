// database/factories/inventoryStock.factory.js
const { defineFactory } = require('./baseFactory');

/**
 * InventoryStock Factory
 * @param {Object} db - Database object with models
 * @returns {Object} Factory instance
 */
const InventoryStockFactory = (db) => {
  return defineFactory(db.InventoryStock, (faker) => {
    const suppliers = [
      'MedSupply Inc',
      'PharmaSource',
      'Global Medical Distributors',
      'HealthCare Supplies Co',
      'MediTech Solutions'
    ];
    
    return {
      quantity: faker.number.int({ min: 10, max: 1000 }),
      supplier: faker.helpers.arrayElement(suppliers),
      expired: faker.date.future({ years: 2 }),
      batchNumber: faker.string.alphanumeric(10).toUpperCase(),
      updateDate: faker.date.recent({ days: 90 })
      // inventoryId will be set in seeder
    };
  });
};

module.exports = InventoryStockFactory;
