//controller/formula.controller.js
const service = require("../services/formula.service");

exports.create = async (req, res) => {
    if (!req.body.name || !req.body.ingredients || !Array.isArray(req.body.ingredients) || req.body.ingredients.length === 0) {
        return res.status(400).send({ message: "Formula name and a non-empty ingredients array are required." });
    }
    try {
        const record = await service.createFormula(req.body);
        res.status(201).send(record);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
exports.findAll = async (req, res) => {
    try {
        const records = await service.findAllFormulas();
        res.status(200).send(records);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
exports.findOne = async (req, res) => {
    const record = await service.findFormulaById(req.params.id);
    if (record) res.status(200).send(record);
    else res.status(404).send({ message: "Not found." });
};
// --- NEW UPDATE CONTROLLER ---
exports.update = async (req, res) => {
  const formulaId = req.params.id;
  try {
    const updatedFormula = await service.updateFormula(formulaId, req.body);
    if (updatedFormula) {
      res.status(200).send(updatedFormula);
    } else {
      res.status(404).send({ message: `Formula with id=${formulaId} not found.` });
    }
  } catch (err) {
    res.status(500).send({ message: err.message || "Error updating Formula." });
  }
};

// --- NEW DELETE CONTROLLER ---
exports.delete = async (req, res) => {
  const formulaId = req.params.id;
  try {
    const result = await service.deleteFormula(formulaId);
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(404).send({ message: `Formula with id=${formulaId} not found.` });
    }
  } catch (err) {
    res.status(500).send({ message: "Could not delete Formula." });
  }
};