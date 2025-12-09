// database/factories/dilution.factory.js
const { defineFactory } = require('./baseFactory');

/**
 * Dilution Factory
 * @param {Object} db - Database object with models
 * @returns {Object} Factory instance
 */
const DilutionFactory = (db) => {
  return defineFactory(db.Dilution, (faker) => {
    const purposes = [
      'Pain relief',
      'Antibiotic treatment',
      'Anti-inflammatory',
      'Cough suppression',
      'Fever reduction',
      'Vitamin supplement'
    ];
    
    return {
      name: `Dilution ${faker.string.alphanumeric(5).toUpperCase()}`,
      purpose: faker.helpers.arrayElement(purposes),
      modifyDate: faker.date.recent({ days: 60 })
      // formulaId will be set in seeder from created formulas
    };
  });
};

module.exports = DilutionFactory;
