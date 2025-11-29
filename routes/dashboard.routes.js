// routes/dashboard.routes.js
const { verifyToken, isAdminOrPharmacist } = require("../middleware/auth.jwt.js");
const controller = require("../controllers/dashboard.controller.js");
var router = require("express").Router();

module.exports = app => {
  router.get("/", [verifyToken, controller.getDashboardData]);

  app.use('/api/dashboard', router);
};