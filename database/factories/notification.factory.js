// database/factories/notification.factory.js
const { defineFactory } = require('./baseFactory');

/**
 * Notification Factory
 * @param {Object} db - Database object with models
 * @returns {Object} Factory instance
 */
const NotificationFactory = (db) => {
  return defineFactory(db.Notification, (faker) => {
    const sourceTypes = ['system', 'user', 'hardware', 'inventory', 'jobcard'];
    const severities = ['low', 'medium', 'high', 'critical'];
    const messages = [
      'Inventory level is low',
      'Hardware maintenance scheduled',
      'Job card approved',
      'Formula created successfully',
      'Report generated',
      'System update available',
      'Hardware malfunction detected',
      'Stock replenishment needed',
      'Job card requires approval',
      'Prescription processed'
    ];
    
    return {
      sourceType: faker.helpers.arrayElement(sourceTypes),
      message: faker.helpers.arrayElement(messages),
      timestamp: faker.date.recent({ days: 30 }),
      isRead: faker.datatype.boolean(),
      severity: faker.helpers.arrayElement(severities)
      // userId and jobcardId will be set in seeder
    };
  });
};

module.exports = NotificationFactory;
