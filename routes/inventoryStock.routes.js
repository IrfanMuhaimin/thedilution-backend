// routes/inventoryStock.routes.js
const { verifyToken, isAdminOrPharmacist } = require("../middleware/auth.jwt");
const controller = require("../controllers/inventoryStock.controller.js");
var router = require("express").Router();

module.exports = app => {
  // Define a new base path for managing individual stock batches
  const basePath = '/api/stock';

  // Get a single stock batch
  router.get("/:id", [verifyToken, isAdminOrPharmacist, controller.findOne]);

  // Update a single stock batch
  router.put("/:id", [verifyToken, isAdminOrPharmacist, controller.update]);

  // Delete a single stock batch
  router.delete("/:id", [verifyToken, isAdminOrPharmacist, controller.delete]);

  app.use(basePath, router);
};