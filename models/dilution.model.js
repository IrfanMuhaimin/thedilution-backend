// models/dilution.model.js
module.exports = (sequelize, DataTypes) => {
  const Dilution = sequelize.define("Dilution", {
    dilutionId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    purpose: {
      type: DataTypes.STRING(255)
    },
    // --- RE-ADD THIS FIELD ---
    formulaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Formulas',
        key: 'formulaId'
      }
    },
    // --- END OF ADDITION ---
    modifyDate: {
      type: DataTypes.DATE
    }
  }, { timestamps: false });

  return Dilution;
};