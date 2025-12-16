const service = require("../services/report.service");
const pdfService = require("../services/pdf.service");

// --- Standard CRUD functions (no changes) ---
exports.generate = async (req, res) => {
    const { type, id } = req.body;
    const generatingUserId = req.userId;
    if (!type || !id) {
        return res.status(400).send({ message: "A 'type' and 'id' are required." });
    }
    try {
        const reportRequest = { type, id, generatingUserId };
        const newReport = await service.generateReport(reportRequest);
        res.status(201).send(newReport);
    } catch (err) {
        res.status(500).send({ message: err.message || "An error occurred while generating the report." });
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
    try {
        const record = await service.findById(req.params.id);
        if (record) res.status(200).send(record);
        else res.status(404).send({ message: "Not found." });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const result = await service.destroy(req.params.id);
        if (result) res.status(200).send(result);
        else res.status(404).send({ message: "Cannot delete." });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// --- [CORRECTED] Generate and stream a PDF ---
exports.generatePDF = async (req, res) => {
    try {
        const reportId = req.params.id;
        const reportData = await service.findById(reportId);

        if (!reportData) {
            return res.status(404).send({ message: "Report not found." });
        }

        // Set headers for file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="report-${reportId}-${reportData.reportType}.pdf"`);

        // --- THIS IS THE ROBUST STREAMING LOGIC ---
        // The PDF document becomes the stream source
        const doc = pdfService.buildReportPDF(reportData);

        // Pipe the PDF document stream directly to the response stream
        doc.pipe(res);

        // Finalize the PDF and end the stream
        doc.end();

    } catch (err) {
        console.error("===== PDF GENERATION FAILED =====");
        console.error(`Error for Report ID: ${req.params.id}`);
        console.error(err);
        console.error("=================================");
        
        // Check if headers have already been sent before trying to send another response
        if (!res.headersSent) {
            res.status(500).send({ message: err.message || "An error occurred while generating the PDF." });
        }
    }
};