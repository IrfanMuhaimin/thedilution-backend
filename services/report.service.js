// services/report.service.js

const db = require("../models");
const { 
  Report, Jobcard, Inventory, Hardware, User, Consumption, 
  Formula, Dilution, FormulaDetail, PrescriptionDetail 
} = db;

async function generateReport(reportRequest) {
  const { type, id, generatingUserId } = reportRequest;
  
  let reportData = {
    reportType: type,
    generatedDate: new Date(),
    userId: generatingUserId
  };

  switch (type) {
    case 'Jobcard': reportData.jobcardId = id; break;
    case 'Inventory': reportData.inventoryId = id; break;
    case 'Hardware': reportData.hardwareId = id; break;
    case 'Consumption': reportData.consumptionId = id; break;
    default: throw new Error("Invalid report type specified.");
  }
  
  const newReport = await Report.create(reportData);
  
  // Return the newly created report using our powerful findById function
  return await findById(newReport.reportId);
}

// --- THIS IS THE KEY CHANGE ---
// We define a reusable, deeply nested include structure.
const fullReportInclude = [
  {
    model: Jobcard,
    include: [
      { model: User, as: 'requester', attributes: { exclude: ['password'] } },
      { model: User, as: 'approver', attributes: { exclude: ['password'] } },
      { model: Hardware },
      { model: PrescriptionDetail },
      { 
        model: Dilution,
        include: {
          model: Formula,
          include: {
            model: FormulaDetail,
            include: [Inventory] // Include the ingredient name
          }
        }
      }
    ]
  },
  { 
    model: Consumption,
    include: [Inventory, Jobcard, Formula]
  },
  { model: Inventory },
  { model: Hardware },
  { model: User, as: 'User', attributes: { exclude: ['password'] } } // The user who generated the report
];
// --- END OF KEY CHANGE ---


async function findAll() {
  return await Report.findAll({
    include: fullReportInclude, // Use the reusable include structure
    order: [['generatedDate', 'DESC']]
  });
}

async function findById(id) {
  return await Report.findByPk(id, {
    include: fullReportInclude // Use the reusable include structure
  });
}

async function destroy(id) {
    const record = await Report.findByPk(id);
    if (!record) return null;
    await record.destroy();
    return { message: "Report deleted." };
}

module.exports = { 
  generateReport,
  findAll, 
  findById, 
  destroy 
};