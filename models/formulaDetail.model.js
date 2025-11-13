// models/formulaDetail.model.js
module.exports = (sequelize, DataTypes) => {
  const FormulaDetail = sequelize.define("FormulaDetail", {
    formulaId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Formulas',
        key: 'formulaId'
      }
    },
    inventoryId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Inventories',
        key: 'inventoryId'
      }
    },
    requiredQuantity: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, { timestamps: false });

  return FormulaDetail;
};