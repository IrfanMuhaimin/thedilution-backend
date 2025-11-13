// services/dilution.service.js
const db = require("../models");
const { Dilution, Formula, FormulaDetail, Inventory } = db;

async function create(data) { return await Dilution.create(data); }
async function findAll() {
  return await Dilution.findAll({
    include: [{
      model: Formula,
      include: [{
        model: FormulaDetail,
        include: [Inventory]
      }]
    }],
    order: [['name', 'ASC']]
  });
}

async function findById(id) {
  return await Dilution.findByPk(id, {
    include: [{
      model: Formula,
      include: [{ 
        model: FormulaDetail,
        include: [Inventory]
      }]
    }]
  });
}
async function update(id, data) {
    const record = await Dilution.findByPk(id);
    if (!record) return null;
    return await record.update(data);
}
async function destroy(id) {
    const record = await Dilution.findByPk(id);
    if (!record) return null;
    await record.destroy();
    return { message: "Dilution deleted." };
}

module.exports = { create, findAll, findById, update, destroy };