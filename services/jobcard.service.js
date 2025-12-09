const db = require("../models");
const axios = require('axios');
const FormData = require('form-data');

const {
  Jobcard, Dilution, Formula, FormulaDetail, Inventory, User, Consumption, Notification, sequelize
} = db;

async function create(data) {
  return await sequelize.transaction(async (t) => {
    const jobcardData = { ...data, status: 'requested', requestDate: new Date() };
    const newJobcard = await Jobcard.create(jobcardData, { transaction: t });
    const adminUser = await User.findOne({ where: { role: 'Admin' }, transaction: t });
    if (adminUser) {
      await Notification.create({
        userId: adminUser.userId,
        jobcardId: newJobcard.jobcardId,
        sourceType: "Jobcard Request",
        message: `New medication request (Jobcard #${newJobcard.jobcardId}) requires approval.`,
        severity: "warning"
      }, { transaction: t });
    } else {
      console.warn("WARNING: No 'Admin' user found to receive approval notification.");
    }
    return newJobcard;
  });
}

async function findAll() {
  // This function does not need changes.
  return await Jobcard.findAll({
    include: [
      { model: User, as: 'requester', attributes: { exclude: ['password'] } },
      { model: User, as: 'approver', attributes: { exclude: ['password'] } },
      { model: Dilution }, { model: PrescriptionDetail }
    ],
    order: [['requestDate', 'DESC']]
  });
}

async function findById(id) {
  // This function does not need changes.
  return await Jobcard.findByPk(id, {
    include: [
      { model: User, as: 'requester', attributes: { exclude: ['password'] } },
      { model: User, as: 'approver', attributes: { exclude: ['password'] } },
      { model: Dilution }, { model: PrescriptionDetail }
    ]
  });
}

async function updateJobcard(jobcardId, updateData) {
  return await sequelize.transaction(async (t) => {
    const jobcard = await Jobcard.findByPk(jobcardId, { transaction: t });
    if (!jobcard) {
      throw new Error("Jobcard not found.");
    }

    if (updateData.status === 'approved' && jobcard.status !== 'approved') {
      const jobcardWithRecipe = await Jobcard.findByPk(jobcardId, {
        include: {
          model: Dilution,
          include: {
            model: Formula,
            include: {
              model: FormulaDetail,
              include: [Inventory] // <-- This query now fetches the hardwarePort
            }
          }
        },
        transaction: t
      });

      const ingredients = jobcardWithRecipe.Dilution?.Formula?.FormulaDetails;
      if (!ingredients || ingredients.length === 0) {
        throw new Error("Approval failed: The formula has no ingredients listed.");
      }

      for (const ingredient of ingredients) {
        const stockItem = await Inventory.findByPk(ingredient.inventoryId, { transaction: t });
        if (!stockItem || stockItem.quantity < ingredient.requiredQuantity) {
          throw new Error(`Insufficient stock for item ${stockItem.name}.`);
        }
        await stockItem.decrement('quantity', { by: ingredient.requiredQuantity, transaction: t });
        await Consumption.create({
          inventoryId: ingredient.inventoryId,
          jobcardId: jobcardId,
          formulaId: jobcardWithRecipe.Dilution.Formula.formulaId,
          quantityUsed: ingredient.requiredQuantity,
          consumptionDate: new Date()
        }, { transaction: t });
      }

      // --- MODIFIED BLOCK TO INCLUDE HARDWARE PORT ---
      const formulaDataForRobot = ingredients.map(ing => {
        if (!ing.Inventory.hardwarePort) {
          throw new Error(`Approval failed: Ingredient '${ing.Inventory.name}' is not assigned to a hardware port.`);
        }
        const ingredientName = ing.Inventory.name.replace(/:|,/g, '');
        const requiredVolume = ing.requiredQuantity;
        const port = ing.Inventory.hardwarePort; // <-- Get the new port data

        return `${ingredientName}:${requiredVolume}:${port}`; // <-- New Format
      }).join(','); // e.g., "Saline:50:A,Glucose:20:B"
      // --------------------------------------------------

      try {
        console.log(`[Integration] Triggering robot for Jobcard #${jobcardId}...`);
        console.log(`[Integration] Sending Formula with Ports: ${formulaDataForRobot}`);
        
        const form = new FormData();
        form.append('task', `Job-${jobcardId}-Dilution-Mix`);
        form.append('message', formulaDataForRobot);

        const robotApiResponse = await axios.post('http://localhost:8088/api/trigger.php', form, {
          headers: form.getHeaders()
        });

        console.log(`[Integration] Success! Robot task created with ID: ${robotApiResponse.data}`);
      } catch (error) {
        console.error("[Integration Error] FAILED to trigger robot:", error.message);
        throw new Error("Could not trigger the robot. Approval cancelled.");
      }
      
      await Notification.create({
        userId: jobcard.userId,
        jobcardId: jobcard.jobcardId,
        sourceType: "Jobcard Approval",
        message: `Your medication request (Jobcard #${jobcardId}) has been approved.`,
        severity: "info"
      }, { transaction: t });
    }

    return await jobcard.update(updateData, { transaction: t });
  });
}

async function destroy(id) {
  const record = await Jobcard.findByPk(id);
  if (!record) return null;
  await record.destroy();
  return { message: "Jobcard deleted." };
}

module.exports = { create, findAll, findById, update: updateJobcard, destroy };