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


// --- EXECUTE (THE NEW FUNCTION) ---
exports.executeJobcard = async (req, res) => {
    const jobcardId = req.params.id; // Get the ID from the URL parameter

    try {
        // Call the service function, which handles the complex logic
        const result = await service.executeJobcard(jobcardId);
        
        // Success: Robot task was triggered
        res.status(200).send(result); 

    } catch (error) {
        console.error(`Error executing Jobcard #${jobcardId}:`, error.message);
        
        // Custom error handling for specific business logic failures
        if (error.message.includes("Jobcard not found")) {
            return res.status(404).send({ message: error.message });
        }
        if (error.message.includes("Cannot execute") || 
            error.message.includes("formula has no ingredients") ||
            error.message.includes("hardware port")) {
            return res.status(400).send({ message: error.message }); // 400 Bad Request/Business Logic Error
        }
        
        // Default catch for server/robot connection errors
        res.status(500).send({ message: error.message || "An unexpected error occurred during execution." });
    }
};