const service = require("../services/report.service");

exports.generate = async (req, res) => {
  const { type, id } = req.body; // Expects a type and an ID
  const generatingUserId = req.userId; // User who clicked "generate"

  if (!type || !id) {
    return res.status(400).send({ message: "A 'type' (e.g., 'Jobcard') and an 'id' are required." });
  }
  
  try {
    const reportRequest = { type, id, generatingUserId };
    const newReport = await service.generateReport(reportRequest);
    res.status(201).send(newReport);
  } catch (err) {
    res.status(500).send({ message: err.message || "An error occurred while generating the report." });
  }
};

exports.create = async (req, res) => {
    if (!req.body.jobcardId || !req.body.inventoryId || !req.body.hardwareId || !req.body.userId) {
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
exports.delete = async (req, res) => {
    const result = await service.destroy(req.params.id);
    if (result) res.status(200).send(result);
    else res.status(404).send({ message: "Cannot delete." });
};