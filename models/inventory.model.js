module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define("Inventory", {
    inventoryId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
     userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'userId'
      }
    },
    name: { type: DataTypes.STRING(100), allowNull: false },
    supplier: { type: DataTypes.STRING(100) },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    expired: { type: DataTypes.DATE },
    unit: { type: DataTypes.STRING(10) },
    status: { type: DataTypes.STRING(25) },
    updateDate: { type: DataTypes.DATE },
    batchNumber: { type: DataTypes.STRING(50) },
    predictedUsage: { type: DataTypes.FLOAT },
    thresholdPoint: { type: DataTypes.INTEGER },
    safetyStockLevel: { type: DataTypes.INTEGER }
  }, { timestamps: false });
  return Inventory;
};