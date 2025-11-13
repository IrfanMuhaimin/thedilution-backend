const { verifyToken, isAdminOrPharmacist } = require("../middleware/auth.jwt");
const controller = require("../controllers/consumption.controller.js");
var router = require("express").Router();

module.exports = app => {
    router.post("/", [verifyToken], controller.create);
    router.get("/", [verifyToken], controller.findAll);
    router.get("/:id", [verifyToken], controller.findOne);
    router.get("/formula/:formulaId", [verifyToken, isAdminOrPharmacist, controller.findByFormula]);
    router.put("/:id", [verifyToken], controller.update);
    router.delete("/:id", [verifyToken], controller.delete);

    app.use('/api/consumptions', router);
};