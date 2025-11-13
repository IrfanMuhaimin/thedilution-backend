module.exports = (sequelize, DataTypes) => {
  const PrescriptionDetail = sequelize.define("PrescriptionDetail", {
    prescriptionId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    allergies: {
      type: DataTypes.STRING(50)
    }
  }, { timestamps: false });

  return PrescriptionDetail;
};