const service = require("../services/consumption.service");

exports.findByFormula = async (req, res) => {
  try {
    const records = await service.findByFormula(req.params.formulaId);
    res.status(200).send(records);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.create = async (req, res) => {
    if (!req.body.inventoryId || !req.body.jobcardId || !req.body.formulaId) {
        return res.status(400).send({ message: "All foreign keys are required." });
    }
    try {
        const record = await service.create(req.body);
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
// Update and Delete are less common for a consumption log, but included for completeness
exports.update = async (req, res) => {
    const updated = await service.update(req.params.id, req.body);
    if (updated) res.status(200).send(updated);
    else res.status(404).send({ message: "Cannot update." });
};
exports.delete = async (req, res) => {
    const result = await service.destroy(req.params.id);
    if (result) res.status(200).send(result);
    else res.status(404).send({ message: "Cannot delete." });
};

exports.findByFormula = async (req, res) => {
  try {
    const records = await service.findByFormula(req.params.formulaId);
    res.status(200).send(records);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};