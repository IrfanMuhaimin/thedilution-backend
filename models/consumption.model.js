// models/consumption.model.js
module.exports = (sequelize, DataTypes) => {
  const Consumption = sequelize.define("Consumption", {
    consumptionId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    inventoryId: { type: DataTypes.INTEGER, allowNull: false },
    jobcardId: { type: DataTypes.INTEGER, allowNull: false },
    formulaId: { type: DataTypes.INTEGER, allowNull: false },
    // --- NEW FIELDS ---
    quantityUsed: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    consumptionDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
    // --- END NEW FIELDS ---
  }, { timestamps: false });

  return Consumption;
};