// routes/prescriptionDetail.routes.js
const { verifyToken, isDoctor, isAdminOrPharmacist } = require("../middleware/auth.jwt");
const controller = require("../controllers/prescriptionDetail.controller.js");
var router = require("express").Router();

module.exports = app => {
  router.post("/", [verifyToken, isDoctor, controller.create]);
  router.get("/", [verifyToken, controller.findAll]);
  router.get("/:id", [verifyToken, controller.findOne]);
  router.put("/:id", [verifyToken, isDoctor, controller.update]);
  router.delete("/:id", [verifyToken, isDoctor, controller.delete]);

  app.use('/api/prescriptions', router);
};