// models/report.model.js
module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define("Report", {
    reportId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    reportType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    generatedDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    jobcardId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    inventoryId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    hardwareId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    consumptionId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, { timestamps: false });

  return Report;
};