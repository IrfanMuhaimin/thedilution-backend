const db = require("../models");
const Notification = db.Notification;

async function createNotification(notificationData) {
  const fullData = { 
    ...notificationData, 
    timestamp: new Date(), 
    isRead: false 
  };
  return await Notification.create(fullData);
}

async function getNotificationsByUserId(userId) {
  return await Notification.findAll({ where: { userId: userId }, order: [['timestamp', 'DESC']] });
}

async function markAsRead(notificationId, userId) {
  const notification = await Notification.findOne({ where: { notificationId: notificationId, userId: userId } });
  if (!notification) {
    return null;
  }
  return await notification.update({ isRead: true });
}

async function deleteNotification(notificationId, userId) {
  const notification = await Notification.findOne({ 
    where: { 
      notificationId: notificationId, 
      userId: userId 
    } 
  });

  if (!notification) {
    return null; 
  }

  await notification.destroy();
  
  return { message: "Notification was deleted successfully." };
}

module.exports = {
  createNotification,
  getNotificationsByUserId,
  markAsRead,
  deleteNotification
};