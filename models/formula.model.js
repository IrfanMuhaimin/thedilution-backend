// models/formula.model.js
module.exports = (sequelize, DataTypes) => {
  const Formula = sequelize.define("Formula", {
    formulaId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    creationDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, { timestamps: false });

  return Formula;
};