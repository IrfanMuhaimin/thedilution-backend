//app.js
require('dotenv').config();

console.log("--- DEBUGGING .env VARIABLES ---");
console.log("SERVER_PORT read from .env:", process.env.SERVER_PORT);
console.log("---------------------------------");

const express = require("express");
const cors = require("cors");

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// --- Database Sync ---
const db = require("./models");
db.sequelize.sync() // { force: true } to drop and re-sync db
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: ", err);
  });

// --- Routes  ---
app.get("/", (req, res) => {
  res.json({ message: "Welcome to The Dilution System backend." });
});

require("./routes/user.routes")(app);
require("./routes/hardware.routes")(app);
require("./routes/inventory.routes")(app);
require("./routes/prescriptionDetail.routes")(app);
require("./routes/formula.routes")(app);
require("./routes/dilution.routes")(app);
require("./routes/jobcard.routes")(app);
require("./routes/consumption.routes")(app);
require("./routes/report.routes")(app);
require("./routes/auth.routes")(app);
require("./routes/hardwareLog.routes")(app);
require("./routes/notification.routes")(app);
require("./routes/dashboard.routes")(app);

// --- Server Listening ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});