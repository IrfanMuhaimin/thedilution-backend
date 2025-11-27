// services/formula.service.js
const db = require("../models");
const { Formula, FormulaDetail, sequelize } = db;
const Inventory = db.Inventory || db.inventory;

async function createFormula(formulaData) {
  const { name, ingredients } = formulaData;
  const result = await sequelize.transaction(async (t) => {
    const newFormula = await Formula.create({ name: name, creationDate: new Date() }, { transaction: t });
    const details = ingredients.map(ing => ({ ...ing, formulaId: newFormula.formulaId }));
    await FormulaDetail.bulkCreate(details, { transaction: t });
    return newFormula;
  });
  return await findFormulaById(result.formulaId);
}

async function findFormulaById(id) {
  return await Formula.findByPk(id, {
    include: [{ 
        model: FormulaDetail, 
        include: [Inventory] 
    }]
  });
}

async function findAllFormulas() {
  return await Formula.findAll({
    include: [{
      model: FormulaDetail,
      include: [Inventory]
    }]
  });
}

async function updateFormula(formulaId, formulaData) {
  const { name, ingredients } = formulaData;
  
  const result = await sequelize.transaction(async (t) => {
    // 1. Find the existing formula
    const formula = await Formula.findByPk(formulaId, { transaction: t });
    if (!formula) {
      throw new Error("Formula not found.");
    }

    // 2. Update the formula's name if provided
    if (name) {
      formula.name = name;
      await formula.save({ transaction: t });
    }

    // 3. If new ingredients are provided, replace the old ones
    if (ingredients && Array.isArray(ingredients)) {
      // First, delete all existing details for this formula
      await FormulaDetail.destroy({ where: { formulaId: formulaId }, transaction: t });

      // Then, create the new ones
      const newDetails = ingredients.map(ing => ({
        formulaId: formulaId,
        inventoryId: ing.inventoryId,
        requiredQuantity: ing.requiredQuantity
      }));
      await FormulaDetail.bulkCreate(newDetails, { transaction: t });
    }
    
    return formula;
  });

  // Return the updated formula with its new details
  return await findFormulaById(result.formulaId);
}

async function deleteFormula(formulaId) {
  return await sequelize.transaction(async (t) => {
    const formula = await Formula.findByPk(formulaId, { transaction: t });
    if (!formula) {
      return null; // Or throw an error if you prefer
    }
    
    // First, delete all associated details from the junction table
    await FormulaDetail.destroy({ where: { formulaId: formulaId }, transaction: t });

    // Then, delete the main formula record
    await formula.destroy({ transaction: t });

    return { message: "Formula and its details were deleted successfully." };
  });
}

module.exports = {
  createFormula,
  findFormulaById,
  findAllFormulas,
  updateFormula,
  deleteFormula
};