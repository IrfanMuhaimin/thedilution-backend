// database/factories/prescriptionDetail.factory.js
const { defineFactory } = require('./baseFactory');

/**
 * PrescriptionDetail Factory
 * @param {Object} db - Database object with models
 * @returns {Object} Factory instance
 */
const PrescriptionDetailFactory = (db) => {
  return defineFactory(db.PrescriptionDetail, (faker) => {
    const commonAllergies = [
      'Penicillin',
      'Sulfa drugs',
      'Aspirin',
      'Ibuprofen',
      'None',
      'Latex',
      'Codeine',
      'Morphine'
    ];
    
    return {
      age: faker.number.int({ min: 1, max: 90 }),
      weight: faker.number.float({ min: 5, max: 150, precision: 0.1 }),
      allergies: faker.helpers.arrayElement(commonAllergies)
    };
  });
};

module.exports = PrescriptionDetailFactory;
