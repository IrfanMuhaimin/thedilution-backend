// database/factories/formula.factory.js
const { defineFactory } = require('./baseFactory');

/**
 * Formula Factory
 * @param {Object} db - Database object with models
 * @returns {Object} Factory instance
 */
const FormulaFactory = (db) => {
  return defineFactory(db.Formula, (faker) => {
    const formulaNames = [
      'Acetaminophen Syrup',
      'Ibuprofen Suspension',
      'Amoxicillin Solution',
      'Diphenhydramine Elixir',
      'Cough Syrup Formula',
      'Antibiotic Mixture',
      'Pain Relief Solution',
      'Vitamin C Solution',
      'Multivitamin Syrup',
      'Antihistamine Mix'
    ];
    
    return {
      name: faker.helpers.arrayElement(formulaNames) + ' ' + faker.string.alphanumeric(3).toUpperCase(),
      creationDate: faker.date.past({ years: 2 })
    };
  });
};

module.exports = FormulaFactory;
