const { verifyToken, isAdminOrPharmacist } = require("../middleware/auth.jwt");
const controller = require("../controllers/consumption.controller.js");
var router = require("express").Router();

module.exports = app => { 
    
    router.get("/formula/:formulaId", [verifyToken, isAdminOrPharmacist, controller.findByFormula]);
    // Standard routes for getting all/one or making admin adjustments
    router.get("/", [verifyToken, isAdminOrPharmacist, controller.findAll]);
    router.get("/:id", [verifyToken, isAdminOrPharmacist, controller.findOne]);
    router.put("/:id", [verifyToken, isAdminOrPharmacist, controller.update]);
    router.delete("/:id", [verifyToken, isAdminOrPharmacist, controller.delete]);

    app.use('/api/consumptions', router);
};