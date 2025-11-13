const { verifyToken, isAdmin } = require("../middleware/auth.jwt");
const users = require("../controllers/user.controller.js");
var router = require("express").Router();

module.exports = function(app) {
  
  router.post("/", users.create);

  router.get("/", [verifyToken, users.findAll]);
  router.get("/:id", [verifyToken, users.findOne]);
  router.put("/:id", [verifyToken, users.update]);
  router.delete("/:id", [verifyToken, isAdmin, users.delete]);

  app.use('/api/users', router);
};