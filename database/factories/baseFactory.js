// database/factories/baseFactory.js
// Base factory helper for creating model instances

const { faker } = require('@faker-js/faker');

/**
 * Factory helper function
 * @param {Object} model - Sequelize model
 * @param {Function} definition - Function that returns object with model attributes
 * @returns {Object} Factory object with methods
 */
const defineFactory = (model, definition) => {
  return {
    /**
     * Create a single instance
     * @param {Object} overrides - Override default attributes
     * @returns {Promise} Created model instance
     */
    async create(overrides = {}) {
      const attributes = { ...definition(faker), ...overrides };
      return await model.create(attributes);
    },

    /**
     * Create multiple instances
     * @param {Number} count - Number of instances to create
     * @param {Object} overrides - Override default attributes for all instances
     * @returns {Promise<Array>} Array of created model instances
     */
    async createMany(count, overrides = {}) {
      const instances = [];
      for (let i = 0; i < count; i++) {
        const attributes = { ...definition(faker), ...overrides };
        instances.push(attributes);
      }
      return await model.bulkCreate(instances);
    },

    /**
     * Make instance without saving to database
     * @param {Object} overrides - Override default attributes
     * @returns {Object} Model instance (not saved)
     */
    make(overrides = {}) {
      const attributes = { ...definition(faker), ...overrides };
      return model.build(attributes);
    },

    /**
     * Generate raw attributes without creating model instance
     * @param {Object} overrides - Override default attributes
     * @returns {Object} Raw attributes object
     */
    raw(overrides = {}) {
      return { ...definition(faker), ...overrides };
    }
  };
};

module.exports = { defineFactory, faker };
