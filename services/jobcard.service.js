/**
 * This service handles all business logic related to Jobcards.
 * It includes creating requests, processing approvals, checking inventory,
 * and triggering the external robot API with detailed formula data.
 */

const db = require("../models");
const axios = require('axios');
const FormData = require('form-data');

// Destructure all the models we'll need for our operations
const {
  Jobcard,
  Hardware,
  Dilution,
  Formula,
  FormulaDetail,
  PrescriptionDetail,
  Inventory, // <-- Crucial for getting ingredient names
  User,
  Consumption,
  Notification,
  sequelize
} = db;

/**
 * Creates a new jobcard and a notification for the first available Admin.
 * @param {object} data - The jobcard data from the request body.
 * @returns {Promise<Jobcard>} The newly created jobcard instance.
 */
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
      console.warn("WARNING: A jobcard was created, but no 'Admin' user was found to receive the approval notification.");
    }
    return newJobcard;
  });
}

/**
 * Finds all jobcards with their related data.
 * @returns {Promise<Jobcard[]>} An array of all jobcards.
 */
async function findAll() {
  return await Jobcard.findAll({
    include: [
      { model: User, as: 'requester', attributes: { exclude: ['password'] } },
      { model: User, as: 'approver', attributes: { exclude: ['password'] } },
      { model: Hardware }, { model: Dilution }, { model: PrescriptionDetail }
    ],
    order: [['requestDate', 'DESC']]
  });
}

/**
 * Finds a single jobcard by its ID.
 * @param {number} id - The ID of the jobcard.
 * @returns {Promise<Jobcard|null>} The found jobcard or null.
 */
async function findById(id) {
  return await Jobcard.findByPk(id, {
    include: [
      { model: User, as: 'requester', attributes: { exclude: ['password'] } },
      { model: User, as: 'approver', attributes: { exclude: ['password'] } },
      { model: Hardware }, { model: Dilution }, { model: PrescriptionDetail }
    ]
  });
}

/**
 * Updates a jobcard. On 'approved' status, it sends detailed formula data to the robot.
 * @param {number} jobcardId - The ID of the jobcard to update.
 * @param {object} updateData - The new data for the jobcard.
 * @returns {Promise<Jobcard>} The updated jobcard instance.
 */
async function updateJobcard(jobcardId, updateData) {
  return await sequelize.transaction(async (t) => {
    const jobcard = await Jobcard.findByPk(jobcardId, { transaction: t });
    if (!jobcard) {
      throw new Error("Jobcard not found.");
    }

    if (updateData.status === 'approved' && jobcard.status !== 'approved') {
      // 1. Get the full recipe, INCLUDING the inventory item details for each ingredient.
      const jobcardWithRecipe = await Jobcard.findByPk(jobcardId, {
        include: {
          model: Dilution,
          include: {
            model: Formula,
            include: {
              model: FormulaDetail,
              include: [Inventory] // <-- This links to the Inventory table to get names
            }
          }
        },
        transaction: t
      });

      const ingredients = jobcardWithRecipe.Dilution?.Formula?.FormulaDetails;
      if (!ingredients || ingredients.length === 0) {
        throw new Error("Approval failed: The formula has no ingredients listed.");
      }

      // 2. Process stock and consumption logs (no changes here).
      for (const ingredient of ingredients) {
        const stockItem = await Inventory.findByPk(ingredient.inventoryId, { transaction: t });
        if (!stockItem || stockItem.quantity < ingredient.requiredQuantity) {
          throw new Error(`Insufficient stock for item ${stockItem.name}. Required: ${ingredient.requiredQuantity}, Available: ${stockItem.quantity || 0}.`);
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

      // 3. --- NEW ---
      // Format the formula data into a simple, parsable string for the robot.
      const formulaDataForRobot = ingredients.map(ing => {
        const ingredientName = ing.Inventory.name.replace(/:|,/g, ''); // Sanitize name
        const requiredVolume = ing.requiredQuantity;
        return `${ingredientName}:${requiredVolume}`; // e.g., "Saline:50"
      }).join(','); // e.g., "Saline:50,Glucose:20,MedX:5"
      // ----------------

      // 4. --- MODIFIED ---
      // Trigger the robot, now including the formula in the 'message' field.
      try {
        console.log(`[Integration] Triggering robot for Jobcard #${jobcardId}...`);
        console.log(`[Integration] Sending Formula: ${formulaDataForRobot}`);
        
        const form = new FormData();
        form.append('task', `Job-${jobcardId}-Dilution-Mix`);
        form.append('message', formulaDataForRobot); // <-- Pass the formula string

        const robotApiResponse = await axios.post('http://robot-server/api/trigger.php', form, {
          headers: form.getHeaders()
        });

        console.log(`[Integration] Success! Robot task created with ID: ${robotApiResponse.data}`);
      } catch (error) {
        console.error("[Integration Error] FAILED to trigger robot:", error.message);
        throw new Error("Could not trigger the robot. The robot service may be offline. Approval cancelled.");
      }
      // --------------------

      // 5. Create notifications (no changes here).
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

/**
 * Deletes a jobcard by its ID.
 * @param {number} id - The ID of the jobcard to delete.
 * @returns {Promise<object|null>} A success message or null if not found.
 */
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