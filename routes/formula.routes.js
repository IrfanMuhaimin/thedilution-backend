// routes/formula.routes.js
const { verifyToken, isAdminOrPharmacist } = require("../middleware/auth.jwt");
const controller = require("../controllers/formula.controller.js");
var router = require("express").Router();

module.exports = app => {
  router.post("/", [verifyToken, isAdminOrPharmacist, controller.create]);
  router.get("/", [verifyToken, controller.findAll]);
  router.get("/:id", [verifyToken, controller.findOne]);
  router.put("/:id", [verifyToken, isAdminOrPharmacist, controller.update]);
  router.delete("/:id", [verifyToken, isAdminOrPharmacist, controller.delete]);

  app.use('/api/formulas', router);
};