const dbConfig = require("../config/db.config.js");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    port: process.env.DB_PORT,
    dialect: dbConfig.dialect,
    operatorsAliases: false,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle
    }
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// --- Import All Models Here ---
db.User = require("./user.model.js")(sequelize, DataTypes);
db.Hardware = require("./hardware.model.js")(sequelize, DataTypes);
db.Inventory = require("./inventory.model.js")(sequelize, DataTypes);
db.PrescriptionDetail = require("./prescriptionDetail.model.js")(sequelize, DataTypes);
db.Formula = require("./formula.model.js")(sequelize, DataTypes);
db.Dilution = require("./dilution.model.js")(sequelize, DataTypes);
db.Jobcard = require("./jobcard.model.js")(sequelize, DataTypes);
db.Consumption = require("./consumption.model.js")(sequelize, DataTypes);
db.Report = require("./report.model.js")(sequelize, DataTypes);
db.HardwareLog = require("./hardwareLog.model.js")(sequelize, DataTypes);
db.Notification = require("./notification.model.js")(sequelize, DataTypes);
db.FormulaDetail = require("./formulaDetail.model.js")(sequelize, DataTypes);

// --- Define All Associations Here ---

// User Associations
db.User.hasMany(db.Jobcard, { foreignKey: 'userId', as: 'requestedJobcards' });
db.User.hasMany(db.Jobcard, { foreignKey: 'approvedByUserId', as: 'approvedJobcards' });
db.User.hasMany(db.Report, { foreignKey: 'userId' });
db.User.hasMany(db.Notification, { foreignKey: 'userId' });
db.User.hasMany(db.Inventory, { foreignKey: 'userId' });

// Hardware Associations
db.Hardware.hasMany(db.Report, { foreignKey: 'hardwareId' });
db.Hardware.hasMany(db.HardwareLog, { foreignKey: 'hardwareId' });
db.Hardware.hasMany(db.Jobcard, { foreignKey: 'hardwareId' });

// Inventory Associations
db.Inventory.hasMany(db.Consumption, { foreignKey: 'inventoryId' });
db.Inventory.hasMany(db.Report, { foreignKey: 'inventoryId' });
db.Inventory.hasMany(db.FormulaDetail, { foreignKey: 'inventoryId' });
db.Inventory.belongsTo(db.User, { foreignKey: 'userId' });

// PrescriptionDetail Associations
db.PrescriptionDetail.hasOne(db.Jobcard, { foreignKey: 'prescriptionId' });

// Formula Associations
db.Formula.hasMany(db.FormulaDetail, { foreignKey: 'formulaId' });
db.Formula.hasMany(db.Dilution, { foreignKey: 'formulaId' });

// FormulaDetail Associations
db.FormulaDetail.belongsTo(db.Formula, { foreignKey: 'formulaId' });
db.FormulaDetail.belongsTo(db.Inventory, { foreignKey: 'inventoryId' });

// Dilution Associations
db.Dilution.belongsTo(db.Formula, { foreignKey: 'formulaId' });
db.Dilution.hasMany(db.Jobcard, { foreignKey: 'dilutionId' });

// Jobcard Associations
db.Jobcard.belongsTo(db.User, { foreignKey: 'userId', as: 'requester' });
db.Jobcard.belongsTo(db.User, { foreignKey: 'approvedByUserId', as: 'approver' });
db.Jobcard.belongsTo(db.PrescriptionDetail, { foreignKey: 'prescriptionId' });
db.Jobcard.belongsTo(db.Dilution, { foreignKey: 'dilutionId' });
db.Jobcard.belongsTo(db.Hardware, { foreignKey: 'hardwareId' });
db.Jobcard.hasMany(db.Report, { foreignKey: 'jobcardId' });
db.Jobcard.hasMany(db.Consumption, { foreignKey: 'jobcardId' });
db.Jobcard.hasMany(db.Notification, { foreignKey: 'jobcardId' });

// Consumption Associations
db.Consumption.belongsTo(db.Inventory, { foreignKey: 'inventoryId' });
db.Consumption.belongsTo(db.Jobcard, { foreignKey: 'jobcardId' });
db.Consumption.belongsTo(db.Formula, { foreignKey: 'formulaId' });
db.Consumption.hasMany(db.Report, { foreignKey: 'consumptionId' });

// Report Associations
db.Report.belongsTo(db.Jobcard, { foreignKey: 'jobcardId' });
db.Report.belongsTo(db.Inventory, { foreignKey: 'inventoryId' });
db.Report.belongsTo(db.Hardware, { foreignKey: 'hardwareId' });
db.Report.belongsTo(db.User, { foreignKey: 'userId' });
db.Report.belongsTo(db.Consumption, { foreignKey: 'consumptionId' });

// HardwareLog Associations
db.HardwareLog.belongsTo(db.Hardware, { foreignKey: 'hardwareId' });

// Notification Associations
db.Notification.belongsTo(db.User, { foreignKey: 'userId' });
db.Notification.belongsTo(db.Jobcard, { foreignKey: 'jobcardId' });


module.exports = db;