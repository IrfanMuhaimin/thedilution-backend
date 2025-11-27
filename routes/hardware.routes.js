const { verifyToken, isAdmin } = require("../middleware/auth.jwt");
const hardware = require("../controllers/hardware.controller.js");
var router = require("express").Router();

module.exports = app => {
  router.post("/", [verifyToken, isAdmin], hardware.create);
  router.get("/", [verifyToken], hardware.findAll);
  router.get("/:id", [verifyToken], hardware.findOne);
  router.put("/:id", [verifyToken, isAdmin], hardware.update);
  router.delete("/:id", [verifyToken, isAdmin], hardware.delete);

  app.use('/api/hardware', router);
};