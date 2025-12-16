//app.js
const path = require('path');
const nodeEnv = process.env.NODE_ENV || 'production';
require('dotenv').config({
  path: path.resolve(process.cwd(), nodeEnv === 'development' ? '.env.development' : '.env')
});
console.log(`[INFO] Running in ${nodeEnv} mode.`);

const express = require("express");
const cors = require("cors");

const app = express();

// --- Middleware ---
// Using cors() without options allows requests from any origin,
// which is perfect for local development (e.g., from localhost:3000).
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---
// This is now the only job of this server.
app.get("/api", (req, res) => {
  res.json({ message: "Welcome to The Dilution System backend API." });
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

db.sequelize.sync({ alter: true })
  .then(() => {
    console.log("✅ Database synced successfully.");
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}.`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to sync database:", err);
    process.exit(1);
  });