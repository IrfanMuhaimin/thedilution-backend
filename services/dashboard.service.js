// services/dashboard.service.js

const db = require("../models");
const { User, Jobcard, Hardware, Dilution } = db;
const { Op } = require("sequelize"); // Import the 'Op' operator for date comparisons

async function getDashboardData(filters) {
  // 1. Get User Distribution by Role
  const userDistribution = await User.findAll({
    attributes: [
      'role',
      [db.sequelize.fn('COUNT', db.sequelize.col('role')), 'count']
    ],
    group: ['role']
  });

  // 2. Get Daily Dilution Request Stats
  const { days = 7 } = filters; // Default to 7 days if no filter is provided
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - parseInt(days));

  const dilutionStats = await Jobcard.findAll({
    attributes: [
      [db.sequelize.fn('DATE', db.sequelize.col('requestDate')), 'date'],
      [db.sequelize.fn('COUNT', db.sequelize.col('jobcardId')), 'totalRequests'],
      [db.sequelize.fn('SUM', db.sequelize.literal("CASE WHEN status = 'approved' THEN 1 ELSE 0 END")), 'approvedCount'],
      [db.sequelize.fn('SUM', db.sequelize.literal("CASE WHEN status = 'rejected' THEN 1 ELSE 0 END")), 'rejectedCount'],
    ],
    where: {
      requestDate: {
        [Op.gte]: dateLimit // Get records greater than or equal to the date limit
      }
    },
    group: [db.sequelize.fn('DATE', db.sequelize.col('requestDate'))],
    order: [[db.sequelize.fn('DATE', db.sequelize.col('requestDate')), 'ASC']]
  });

  // 3. Get Machine Distribution (Active/Inactive)
  const machineDistribution = await Hardware.findAll({
    attributes: [
      'status',
      [db.sequelize.fn('COUNT', db.sequelize.col('status')), 'count']
    ],
    group: ['status']
  });

  // 4. Get Machines Currently Running a Jobcard
  const activeMachines = await Hardware.findAll({
    where: {
      status: true // Assuming 'true' means active/online
    },
    include: [{
      model: Jobcard,
      where: {
        // A "running" jobcard could be 'approved' or 'in_progress'
        status: {
          [Op.in]: ['approved', 'in_progress']
        }
      },
      required: true, // This makes it an INNER JOIN - only return hardware that HAS a running jobcard
      include: [Dilution] // Also include the details of the dilution being prepared
    }]
  });

  // Format the data into a clean dashboard object
  return {
    userDistribution,
    dilutionStats,
    machineDistribution,
    activeMachines
  };
}

module.exports = {
  getDashboardData
};