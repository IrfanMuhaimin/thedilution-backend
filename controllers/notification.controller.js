const notificationService = require("../services/notification.service.js");

exports.create = async (req, res) => {
  if (!req.body.userId || !req.body.jobcardId || !req.body.message) {
    return res.status(400).send({ message: "userId, jobcardId, and message are required." });
  }
  try {
    const notificationData = { ...req.body, timestamp: new Date(), isRead: false };
    const newNotification = await notificationService.createNotification(notificationData);
    res.status(201).send(newNotification);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error creating Notification." });
  }
};

// Gets notifications for the currently logged-in user
exports.findMyNotifications = async (req, res) => {
  try {
    // req.userId is attached by our verifyToken middleware
    const notifications = await notificationService.getNotificationsByUserId(req.userId);
    res.status(200).send(notifications);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error retrieving notifications." });
  }
};

// Marks a specific notification for the logged-in user as read
exports.markAsRead = async (req, res) => {
  const notificationId = req.params.id;
  try {
    // req.userId ensures a user can only mark their own notifications as read
    const updatedNotification = await notificationService.markAsRead(notificationId, req.userId);
    if (updatedNotification) {
      res.status(200).send(updatedNotification);
    } else {
      res.status(404).send({ message: "Notification not found or access denied." });
    }
  } catch (err) {
    res.status(500).send({ message: "Error updating notification." });
  }
};

exports.delete = async (req, res) => {
  const notificationId = req.params.id;
  // req.userId is attached by our verifyToken middleware
  const userId = req.userId; 

  try {
    const result = await notificationService.deleteNotification(notificationId, userId);
    
    if (result) {
      res.status(200).send(result);
    } else {
      // This happens if the notification doesn't exist OR the user doesn't own it
      res.status(404).send({ message: "Notification not found or access denied." });
    }
  } catch (err) {
    res.status(500).send({ message: err.message || "Error deleting notification." });
  }
};