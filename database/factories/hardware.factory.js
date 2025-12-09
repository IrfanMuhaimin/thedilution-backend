// database/factories/hardware.factory.js
const { defineFactory } = require('./baseFactory');

/**
 * Hardware Factory
 * @param {Object} db - Database object with models
 * @returns {Object} Factory instance
 */
const HardwareFactory = (db) => {
  return defineFactory(db.Hardware, (faker) => {
    const hardwareTypes = ['Dispenser', 'Mixer', 'Analyzer', 'Centrifuge', 'Scale', 'Printer'];
    
    return {
      name: `${faker.helpers.arrayElement(hardwareTypes)} ${faker.number.int({ min: 100, max: 999 })}`,
      description: faker.commerce.productDescription(),
      status: faker.datatype.boolean(),
      lastMaintenanceDate: faker.date.past({ years: 1 })
    };
  });
};

module.exports = HardwareFactory;
