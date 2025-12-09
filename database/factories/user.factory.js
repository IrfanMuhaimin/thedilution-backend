// database/factories/user.factory.js
const { defineFactory } = require('./baseFactory');
const bcrypt = require('bcryptjs');

/**
 * User Factory
 * @param {Object} db - Database object with models
 * @returns {Object} Factory instance
 */
const UserFactory = (db) => {
  return defineFactory(db.User, (faker) => {
    const departments = ['Pharmacy', 'Laboratory', 'Administration', 'IT', 'Management'];
    const roles = ['Admin', 'Pharmacist', 'Doctor'];
    const statuses = ['active', 'inactive', 'suspended'];
    
    return {
      username: faker.internet.username(),
      password: bcrypt.hashSync('password123', 8), // Default password for testing
      role: faker.helpers.arrayElement(roles),
      department: faker.helpers.arrayElement(departments),
      status: faker.helpers.arrayElement(statuses),
      active: faker.date.recent({ days: 30 }),
      biometricHash: faker.string.alphanumeric(64),
      lastAccessAttempt: faker.date.recent({ days: 7 }),
      biometricApprove: faker.datatype.boolean()
    };
  });
};

module.exports = UserFactory;
