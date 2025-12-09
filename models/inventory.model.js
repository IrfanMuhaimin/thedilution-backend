// models/inventory.model.js
module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define("Inventory", {
    inventoryId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    userId: { type: DataTypes.INTEGER },
    name: { type: DataTypes.STRING(100), allowNull: false },

    hardwarePort: {
      type: DataTypes.STRING(10), 
      allowNull: true 
    },
    
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    unit: { type: DataTypes.STRING(10) },
    status: { type: DataTypes.STRING(25) },
    updateDate: { type: DataTypes.DATE },
    
    predictedStocking: {
      type: DataTypes.DATE,
      allowNull: true
    }

  }, { timestamps: false });

  return Inventory;
};