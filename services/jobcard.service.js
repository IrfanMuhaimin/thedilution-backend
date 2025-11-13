const db = require("../models");
const { 
  Jobcard, 
  Hardware, 
  Dilution, 
  Formula, 
  FormulaDetail, 
  PrescriptionDetail, 
  Inventory, 
  User, 
  Consumption,
  Notification,
  sequelize 
} = db;

async function create(data) {
  return await sequelize.transaction(async (t) => {
    // 1. Create the jobcard
    const jobcardData = { ...data, requestDate: new Date() };
    const newJobcard = await Jobcard.create(jobcardData, { transaction: t });

    // 2. Automatically create the "request" notification
    // We can now omit timestamp and isRead
    const approverUserId = 1; // Assuming Admin (user 1) is the default approver
    await Notification.create({
      userId: approverUserId,
      jobcardId: newJobcard.jobcardId,
      sourceType: "Jobcard Request",
      message: `New medication request (Jobcard #${newJobcard.jobcardId}) requires approval.`,
      severity: "warning"
    }, { transaction: t });
    
    return newJobcard;
  });
}

async function findAll() {
  return await Jobcard.findAll({
    include: [
      { model: User, as: 'requester', attributes: { exclude: ['password'] } },
      { model: User, as: 'approver', attributes: { exclude: ['password'] } },
      { model: Hardware },
      { model: Dilution },
      { model: PrescriptionDetail }
    ],
    order: [['requestDate', 'DESC']]
  });
}

async function findById(id) {
  return await Jobcard.findByPk(id, {
    include: [
      { model: User, as: 'requester', attributes: { exclude: ['password'] } },
      { model: User, as: 'approver', attributes: { exclude: ['password'] } },
      { model: Hardware },
      { model: Dilution },
      { model: PrescriptionDetail }
    ]
  });
}

async function updateJobcard(jobcardId, updateData) {
  return await sequelize.transaction(async (t) => {
    const jobcard = await Jobcard.findByPk(jobcardId, { transaction: t });
    if (!jobcard) {
      throw new Error("Jobcard not found.");
    }

    // This block triggers on approval
    if (updateData.status === 'approved' && jobcard.status !== 'approved') {
      const jobcardWithRecipe = await Jobcard.findByPk(jobcardId, {
        include: {
          model: Dilution,
          include: {
            model: Formula,
            include: { model: FormulaDetail }
          }
        },
        transaction: t
      });

      const ingredients = jobcardWithRecipe.Dilution.Formula.FormulaDetails;
      if (!ingredients || ingredients.length === 0) {
        throw new Error("Cannot approve jobcard: The formula has no ingredients listed.");
      }

      // Loop to deduct stock and create consumption logs
      for (const ingredient of ingredients) {
        const stockItem = await Inventory.findByPk(ingredient.inventoryId, { transaction: t });
        if (!stockItem || stockItem.quantity < ingredient.requiredQuantity) {
          throw new Error(`Insufficient stock for inventory item ID ${ingredient.inventoryId}. Required: ${ingredient.requiredQuantity}, Available: ${stockItem.quantity}.`);
        }
        
        await Inventory.decrement('quantity', {
          by: ingredient.requiredQuantity,
          where: { inventoryId: ingredient.inventoryId },
          transaction: t
        });

        await Consumption.create({
          inventoryId: ingredient.inventoryId,
          jobcardId: jobcardId,
          formulaId: jobcardWithRecipe.Dilution.Formula.formulaId,
          quantityUsed: ingredient.requiredQuantity,
          consumptionDate: new Date()
        }, { transaction: t });
      }

      // Automatically create the "approved" notification
      // We can now omit timestamp and isRead
       await Notification.create({
        userId: jobcard.userId,
        jobcardId: jobcard.jobcardId,
        sourceType: "Jobcard Approval",
        message: `Your medication request (Jobcard #${jobcard.jobcardId}) has been approved.`,
        severity: "info"
      }, { transaction: t });
    }

    const updatedJobcard = await jobcard.update(updateData, { transaction: t });
    return updatedJobcard;
  });
}

async function destroy(id) {
    const record = await Jobcard.findByPk(id);
    if (!record) return null;
    await record.destroy();
    return { message: "Jobcard deleted." };
}

module.exports = {
  create,
  findAll,
  findById,
  update: updateJobcard,
  destroy
};