// controllers/inventoryStock.controller.js
const service = require("../services/inventoryStock.service");

exports.findOne = async (req, res) => {
    try {
        const record = await service.findById(req.params.id);
        if (record) res.status(200).send(record);
        else res.status(404).send({ message: "Not found." });
    } catch(err) { res.status(500).send({ message: err.message }); }
};

exports.update = async (req, res) => {
    try {
        const updated = await service.updateStock(req.params.id, req.body);
        res.status(200).send(updated);
    } catch(err) { res.status(500).send({ message: err.message }); }
};

exports.delete = async (req, res) => {
    try {
        const result = await service.deleteStock(req.params.id);
        res.status(200).send(result);
    } catch(err) { res.status(500).send({ message: err.message }); }
};