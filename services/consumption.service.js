const db = require("../models");
const { Consumption, Jobcard, Inventory, Formula } = db;

async function findByFormula(formulaId) {
  return await Consumption.findAll({
    where: { formulaId: formulaId },
    include: [
      { model: Inventory },
      { model: Jobcard } 
    ],
    order: [['consumptionDate', 'DESC']]
  });
}

async function findAll() {
  return await Consumption.findAll({
    include: [
      { model: Jobcard },
      { model: Inventory },
      { model: Formula }
    ]
  });
}

async function findById(id) {
  return await Consumption.findByPk(id, {
    include: [
      { model: Jobcard },
      { model: Inventory },
      { model: Formula }
    ]
  });
}
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

module.exports = { create, findAll, findById, update, destroy };