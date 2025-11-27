//controllers/hardware.controller.js
const hardwareService = require("../services/hardware.service");

exports.create = async (req, res) => {
  if (!req.body.name || !req.body.status) {
    return res.status(400).send({ message: "Name and status are required." });
  }
  try {
    const newHardware = await hardwareService.createHardware(req.body);
    res.status(201).send(newHardware);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error creating Hardware." });
  }
};

exports.findAll = async (req, res) => {
  try {
    const hardware = await hardwareService.getAllHardware();
    res.status(200).send(hardware);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error retrieving hardware." });
  }
};

exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
    const hardware = await hardwareService.getHardwareById(id);
    if (hardware) {
      res.status(200).send(hardware);
    } else {
      res.status(404).send({ message: `Cannot find Hardware with id=${id}.` });
    }
  } catch (err) {
    res.status(500).send({ message: "Error retrieving Hardware with id=" + id });
  }
};

exports.update = async (req, res) => {
  const id = req.params.id;
  try {
    const updatedHardware = await hardwareService.updateHardware(id, req.body);
    if (updatedHardware) {
      res.status(200).send(updatedHardware);
    } else {
      res.status(404).send({ message: `Cannot update Hardware with id=${id}.` });
    }
  } catch (err) {
    res.status(500).send({ message: "Error updating Hardware with id=" + id });
  }
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await hardwareService.deleteHardware(id);
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(404).send({ message: `Cannot delete Hardware with id=${id}.` });
    }
  } catch (err) {
    res.status(500).send({ message: "Could not delete Hardware with id=" + id });
  }
};