// models/notification.model.js

module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define("Notification", {
    notificationId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    userId: { type: DataTypes.INTEGER, allowNull: false /* FK */ },
    jobcardId: { type: DataTypes.INTEGER, allowNull: false /* FK */ },
    sourceType: { type: DataTypes.STRING(50), allowNull: false },
    message: { type: DataTypes.STRING(255), allowNull: false },
    
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW 
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },

    severity: {
      type: DataTypes.STRING(20)
    }
  }, { timestamps: false });

  return Notification;
};