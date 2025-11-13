module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    username: { type: DataTypes.STRING(255), allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: false }, // Note: In a real app, you must hash this!
    role: { type: DataTypes.STRING(255), allowNull: false },
    department: { type: DataTypes.STRING(50), allowNull: false },
    status: { type: DataTypes.STRING(50), allowNull: false },
    active: { type: DataTypes.DATE, allowNull: false },
    biometricHash: { type: DataTypes.STRING },
    lastAccessAttempt: { type: DataTypes.DATE },
    biometricApprove: { type: DataTypes.BOOLEAN }
  }, { timestamps: false });
  return User;
};