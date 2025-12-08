// services/consumption.service.js
const db = require("../models");
const { Consumption, Jobcard, Inventory, Formula, User } = db;

// New function to find all consumption events for a specific formula
async function findByFormula(formulaId) {
  return await Consumption.findAll({
    where: { formulaId: formulaId },
    include: [
      { 
        model: Inventory, // To show what was used and its CURRENT balance
        include: [User]   // Also show who last managed that inventory item
      }, 
      { 
        model: Jobcard,   // To show which jobcard triggered the consumption
        include: [{ model: User, as: 'requester' }] // Show who requested the jobcard
      }   
    ],
    order: [['consumptionDate', 'DESC']]
  });
}

// Enhance existing functions to be more informative
async function findAll() {
  return await Consumption.findAll({ include: [Inventory, Jobcard, Formula] });
}

async function findById(id) {
  return await Consumption.findByPk(id, { include: [Inventory, Jobcard, Formula] });
}

// Keep CRUD functions for potential admin adjustments, but they are not the primary workflow.
async function create(data) { return await Consumption.create(data); }
async function update(id, data) {
    const record = await Consumption.findByPk(id);
    if (!record) return null;
    return await record.update(data);
}
async function destroy(id) {
    const record = await Consumption.findByPk(id);
    if (!record) return null;
    await record.destroy();
    return { message: "Consumption deleted." };
}

module.exports = {
  findByFormula, // <-- NEW
  findAll,
  findById,
  create,
  update,
  destroy
};