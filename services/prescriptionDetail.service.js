const db = require("../models");
const PrescriptionDetail = db.PrescriptionDetail;

async function createPrescription(data) {
    return await PrescriptionDetail.create(data);
}
async function getAllPrescriptions() {
    return await PrescriptionDetail.findAll();
}
async function getPrescriptionById(id) {
    return await PrescriptionDetail.findByPk(id);
}
async function updatePrescription(id, data) {
    const record = await PrescriptionDetail.findByPk(id);
    if (!record) return null;
    return await record.update(data);
}
async function deletePrescription(id) {
    const record = await PrescriptionDetail.findByPk(id);
    if (!record) return null;
    await record.destroy();
    return { message: "PrescriptionDetail deleted successfully." };
}

module.exports = {
    createPrescription,
    getAllPrescriptions,
    getPrescriptionById,
    updatePrescription,
    deletePrescription
};