// database/factories/index.js
// Central factory registry

const UserFactory = require('./user.factory');
const HardwareFactory = require('./hardware.factory');
const InventoryFactory = require('./inventory.factory');
const FormulaFactory = require('./formula.factory');
const PrescriptionDetailFactory = require('./prescriptionDetail.factory');
const DilutionFactory = require('./dilution.factory');
const InventoryStockFactory = require('./inventoryStock.factory');
const NotificationFactory = require('./notification.factory');

/**
 * Initialize all factories with database models
 * @param {Object} db - Database object with models
 * @returns {Object} Object containing all factories
 */
const initializeFactories = (db) => {
  return {
    User: UserFactory(db),
    Hardware: HardwareFactory(db),
    Inventory: InventoryFactory(db),
    Formula: FormulaFactory(db),
    PrescriptionDetail: PrescriptionDetailFactory(db),
    Dilution: DilutionFactory(db),
    InventoryStock: InventoryStockFactory(db),
    Notification: NotificationFactory(db)
  };
};

module.exports = initializeFactories;
