// models/inventoryStock.model.js
module.exports = (sequelize, DataTypes) => {
  const InventoryStock = sequelize.define("InventoryStock", {
    inventoryStockId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    inventoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Inventories',
        key: 'inventoryId'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    supplier: { type: DataTypes.STRING(100) },
    expired: { type: DataTypes.DATE },
    batchNumber: { type: DataTypes.STRING(50) },
    updateDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, { timestamps: false });

  return InventoryStock;
};