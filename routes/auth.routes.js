module.exports = app => {
  const authController = require("../controllers/auth.controller.js");
  var router = require("express").Router();

  // Route for user login
  router.post("/login", authController.login);

  app.use('/api/auth', router);
};