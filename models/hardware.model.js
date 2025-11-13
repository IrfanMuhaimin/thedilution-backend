// models/hardware.model.js

module.exports = (sequelize, DataTypes) => {
  const Hardware = sequelize.define("Hardware", {
    hardwareId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    lastMaintenanceDate: {
      type: DataTypes.DATE,
      allowNull: true // This was corrected in a previous step
    }
  }, { timestamps: false });

  return Hardware;
};