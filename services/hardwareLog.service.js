const db = require("../models");
const HardwareLog = db.HardwareLog;

async function createLog(logData) {
  return await HardwareLog.create(logData);
}

async function getAllLogs() {
  return await HardwareLog.findAll();
}

async function getLogsByHardwareId(hardwareId) {
  return await HardwareLog.findAll({ where: { hardwareId: hardwareId } });
}

module.exports = {
  createLog,
  getAllLogs,
  getLogsByHardwareId
};