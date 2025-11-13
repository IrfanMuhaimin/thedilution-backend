const service = require("../services/jobcard.service");

exports.create = async (req, res) => {
    if (!req.body.dilutionId || !req.body.prescriptionId || !req.body.userId) {
        return res.status(400).send({ message: "dilutionId, prescriptionId, and userId are required." });
    }
    try {
        const record = await service.create({ ...req.body, status: 'requested', requestDate: new Date() });
        res.status(201).send(record);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
exports.findAll = async (req, res) => {
    try {
        const records = await service.findAll();
        res.status(200).send(records);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
exports.findOne = async (req, res) => {
    const record = await service.findById(req.params.id);
    if (record) res.status(200).send(record);
    else res.status(404).send({ message: "Not found." });
};
exports.update = async (req, res) => {
  const id = req.params.id;
  try {
    const updated = await service.update(id, req.body);
    if (updated) {
      res.status(200).send(updated);
    } else {
      res.status(404).send({ message: "Cannot update. Jobcard not found." });
    }
  } catch (err) {
    if (err.message.startsWith("Insufficient stock")) {
      return res.status(409).send({ message: err.message });
    }
    res.status(500).send({ message: err.message || "An error occurred while updating the Jobcard." });
  }
};
exports.delete = async (req, res) => {
    const result = await service.destroy(req.params.id);
    if (result) res.status(200).send(result);
    else res.status(404).send({ message: "Cannot delete." });
};