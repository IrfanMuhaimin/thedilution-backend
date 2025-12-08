//app.js
require('dotenv').config();

const express = require("express");
const cors = require("cors");

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes --- (Define them before the DB sync)
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
require("./routes/inventoryStock.routes")(app);


// --- Database Sync and Server Start ---
const db = require("./models");
const PORT = process.env.PORT || 8080;

// The { force: true } option will drop tables if they exist.
// Use it only in development. Remove for production.
// db.sequelize.sync({ force: true })
db.sequelize.sync()
  .then(() => {
    console.log("✅ Database synced successfully.");
    
    // --- Start Listening for Requests ---
    // This part only runs if the database sync is successful
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}.`);
      console.log("   Waiting for incoming requests...");
    });
  })
  .catch((err) => {
    // This part runs if the database sync fails
    console.error("❌ Failed to sync database:", err);
    // Exit the process with an error code, which is good for Docker
    process.exit(1);
  });