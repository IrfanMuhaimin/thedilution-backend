// routes/jobcard.routes.js
const { verifyToken, isAdminOrPharmacist } = require("../middleware/auth.jwt");
const controller = require("../controllers/jobcard.controller.js");
var router = require("express").Router();

module.exports = app => {
  router.post("/", [verifyToken, controller.create]); 
  router.get("/", [verifyToken, controller.findAll]);
  router.get("/:id", [verifyToken, controller.findOne]);
  router.post("/:id/execute", [verifyToken, isAdminOrPharmacist, controller.executeJobcard]);
  router.put("/:id", [verifyToken, isAdminOrPharmacist, controller.update]);
  router.delete("/:id", [verifyToken, isAdminOrPharmacist, controller.delete]);

  app.use('/api/jobcards', router);
};