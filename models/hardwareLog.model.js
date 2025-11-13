module.exports = (sequelize, DataTypes) => {
  const HardwareLog = sequelize.define("HardwareLog", {
    hardwareLogId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    hardwareId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Hardware', // Table name is 'Hardware'
        key: 'hardwareId'
      }
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false
    },
    sensorType: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    sensorValue: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    unitMeasure: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    anomalyFlag: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, { timestamps: false });

  return HardwareLog;
};