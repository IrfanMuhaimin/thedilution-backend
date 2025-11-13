const service = require("../services/dilution.service");

exports.create = async (req, res) => {
    if (!req.body.name || !req.body.formulaId) { // formulaId is required again
        return res.status(400).send({ message: "Name and formulaId are required." });
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