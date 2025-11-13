const { verifyToken } = require("../middleware/auth.jwt");
const controller = require("../controllers/hardwareLog.controller.js");
var router = require("express").Router();

module.exports = app => {
  // Creating a log is protected
  router.post("/", [verifyToken, controller.create]);
  
  // Viewing logs is protected
  router.get("/", [verifyToken, controller.findAll]);
  router.get("/hardware/:id", [verifyToken, controller.findByHardware]);
  
  app.use('/api/logs', router);
};