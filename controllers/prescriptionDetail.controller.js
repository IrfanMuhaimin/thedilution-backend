const service = require("../services/prescriptionDetail.service");

exports.create = async (req, res) => {
    if (req.body.age === undefined || req.body.weight === undefined) {
        return res.status(400).send({ message: "Age and weight are required." });
    }
    try {
        const record = await service.createPrescription(req.body);
        res.status(201).send(record);
    } catch (err) {
        res.status(500).send({ message: err.message || "Error creating PrescriptionDetail." });
    }
};

exports.findAll = async (req, res) => {
    try {
        const records = await service.getAllPrescriptions();
        res.status(200).send(records);
    } catch (err) {
        res.status(500).send({ message: err.message || "Error retrieving PrescriptionDetails." });
    }
};

exports.findOne = async (req, res) => {
    try {
        const record = await service.getPrescriptionById(req.params.id);
        if (record) res.status(200).send(record);
        else res.status(404).send({ message: `Not found with id=${req.params.id}.` });
    } catch (err) {
        res.status(500).send({ message: "Error retrieving with id=" + req.params.id });
    }
};

exports.update = async (req, res) => {
    try {
        const updated = await service.updatePrescription(req.params.id, req.body);
        if (updated) res.status(200).send(updated);
        else res.status(404).send({ message: `Cannot update with id=${req.params.id}.` });
    } catch (err) {
        res.status(500).send({ message: "Error updating with id=" + req.params.id });
    }
};

exports.delete = async (req, res) => {
    try {
        const result = await service.deletePrescription(req.params.id);
        if (result) res.status(200).send(result);
        else res.status(404).send({ message: `Cannot delete with id=${req.params.id}.` });
    } catch (err) {
        res.status(500).send({ message: "Error deleting with id=" + req.params.id });
    }
};