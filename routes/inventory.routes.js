// routes/inventory.routes.js
const { verifyToken, isAdminOrPharmacist, isAdmin } = require("../middleware/auth.jwt");
const controller = require("../controllers/inventory.controller.js");
var router = require("express").Router();

module.exports = app => {
  router.post("/", [verifyToken, isAdminOrPharmacist, controller.create]);

  router.post("/:id/stock", [verifyToken, isAdminOrPharmacist, controller.addStock]);

  router.get("/", [verifyToken, controller.findAll]);
  router.get("/:id", [verifyToken, controller.findOne]);

  router.put("/:id", (req, res) => res.status(405).send({ message: "Direct updates not allowed." }));
  router.delete("/:id", [verifyToken, isAdmin, controller.delete]);

  app.use('/api/inventory', router);
};