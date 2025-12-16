// routes/prescriptionDetail.routes.js

// --- 1. IMPORT the new isAdminOrDoctor function ---
const { verifyToken, isDoctor, isAdminOrDoctor } = require("../middleware/auth.jwt"); 
const controller = require("../controllers/prescriptionDetail.controller.js");
var router = require("express").Router();

module.exports = app => {
  router.post("/", [verifyToken, isAdminOrDoctor, controller.create]);
  
  router.get("/", [verifyToken, controller.findAll]);
  router.get("/:id", [verifyToken, controller.findOne]);
  
  router.put("/:id", [verifyToken, isAdminOrDoctor, controller.update]);
  
  router.delete("/:id", [verifyToken, isAdminOrDoctor, controller.delete]);

  app.use('/api/prescriptions', router);
};