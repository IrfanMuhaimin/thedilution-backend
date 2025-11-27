// routes/auth.routes.js
const authController = require("../controllers/auth.controller.js");
const { verifyToken } = require("../middleware/auth.jwt");
var router = require("express").Router();

module.exports = app => {
  router.post("/login", authController.login);
  router.post("/logout", [verifyToken], authController.logout);

  app.use('/api/auth', router);
};