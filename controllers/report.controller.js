const service = require("../services/report.service");
const pdfService = require("../services/pdf.service");

// Generate a new report record
exports.generate = async (req, res) => {
  const { type, id } = req.body;
  const generatingUserId = req.userId;

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

// Generate and stream a PDF for an existing report
exports.generatePDF = async (req, res) => {
  try {
    const reportId = req.params.id;
    const reportData = await service.findById(reportId);

    if (!reportData) {
      return res.status(404).send({ message: "Report not found." });
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report-${reportId}-${reportData.reportType}.pdf"`);

    pdfService.buildReportPDF(
      (chunk) => res.write(chunk),
      () => res.end(),
      reportData
    );

  } catch (err) {
    res.status(500).send({ message: err.message || "An error occurred while generating the PDF." });
  }
};

// Standard CRUD functions
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