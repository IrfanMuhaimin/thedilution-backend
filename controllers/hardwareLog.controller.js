const hardwareLogService = require("../services/hardwareLog.service.js");

exports.create = async (req, res) => {
  if (!req.body.hardwareId || !req.body.sensorType || req.body.sensorValue === undefined) {
    return res.status(400).send({ message: "hardwareId, sensorType, and sensorValue are required." });
  }
  try {
    const logData = { ...req.body, timestamp: new Date() };
    const newLog = await hardwareLogService.createLog(logData);
    res.status(201).send(newLog);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error creating HardwareLog." });
  }
};

exports.findAll = async (req, res) => {
  try {
    const logs = await hardwareLogService.getAllLogs();
    res.status(200).send(logs);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error retrieving logs." });
  }
};

exports.findByHardware = async (req, res) => {
  const hardwareId = req.params.id;
  try {
    const logs = await hardwareLogService.getLogsByHardwareId(hardwareId);
    res.status(200).send(logs);
  } catch (err) {
    res.status(500).send({ message: `Error retrieving logs for hardwareId=${hardwareId}.` });
  }
};