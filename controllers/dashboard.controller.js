// controllers/dashboard.controller.js
const dashboardService = require("../services/dashboard.service.js");

exports.getDashboardData = async (req, res) => {
  try {
    // req.query will contain any URL parameters, e.g., ?days=14
    const filters = req.query;
    const data = await dashboardService.getDashboardData(filters);
    res.status(200).send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "An error occurred while retrieving dashboard data."
    });
  }
};