//services/hardware.service.js
const db = require("../models");
const Hardware = db.Hardware;

async function createHardware(hardwareData) {
  return await Hardware.create(hardwareData);
}

async function getAllHardware() {
  return await Hardware.findAll();
}

async function getHardwareById(id) {
  return await Hardware.findByPk(id);
}

async function updateHardware(id, hardwareData) {
  const hardware = await Hardware.findByPk(id);
  if (!hardware) {
    return null;
  }
  return await hardware.update(hardwareData);
}

async function deleteHardware(id) {
  const hardware = await Hardware.findByPk(id);
  if (!hardware) {
    return null;
  }
  await hardware.destroy();
  return { message: "Hardware was deleted successfully." };
}

module.exports = {
  createHardware,
  getAllHardware,
  getHardwareById,
  updateHardware,
  deleteHardware
};