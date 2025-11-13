// routes/notification.routes.js

const { verifyToken } = require("../middleware/auth.jwt");
const controller = require("../controllers/notification.controller.js");
var router = require("express").Router();

module.exports = app => {
  router.post("/", [verifyToken, controller.create]);
  router.get("/mine", [verifyToken, controller.findMyNotifications]);
  // Mark a notification as read by its ID
  router.put("/read/:id", [verifyToken, controller.markAsRead]);
  router.delete("/:id", [verifyToken, controller.delete]);

  app.use('/api/notifications', router);
};