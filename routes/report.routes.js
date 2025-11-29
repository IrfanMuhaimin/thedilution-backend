// routes/report.routes.js
const { verifyToken, isAdminOrPharmacist } = require("../middleware/auth.jwt");
const controller = require("../controllers/report.controller.js");
var router = require("express").Router();

module.exports = app => {
  router.post("/generate", [verifyToken, isAdminOrPharmacist, controller.generate]);
  router.get("/:id/pdf", [verifyToken, isAdminOrPharmacist, controller.generatePDF]);
  router.get("/", [verifyToken, isAdminOrPharmacist, controller.findAll]);
  router.get("/:id", [verifyToken, isAdminOrPharmacist, controller.findOne]);
  router.delete("/:id", [verifyToken, isAdminOrPharmacist, controller.delete]);

  app.use('/api/reports', router);
};