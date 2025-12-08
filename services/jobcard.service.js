/**
 * This service handles all business logic related to Jobcards.
 * It includes creating requests, processing approvals, checking inventory,
 * and triggering the external robot API.
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
  Inventory,
  User, // <-- User model is needed for the dynamic lookup
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
  // Use a transaction to ensure both the jobcard and notification are created successfully, or neither are.
  return await sequelize.transaction(async (t) => {
    // 1. Create the jobcard itself with an initial 'requested' status.
    const jobcardData = { ...data, status: 'requested', requestDate: new Date() };
    const newJobcard = await Jobcard.create(jobcardData, { transaction: t });

    // 2. --- DYNAMIC ADMIN LOOKUP (THE FIX) ---
    // Instead of using a hard-coded ID, find the first user with the 'Admin' role.
    const adminUser = await User.findOne({
      where: { role: 'Admin' },
      transaction: t
    });

    // 3. Create a notification only if an Admin user was found.
    if (adminUser) {
      await Notification.create({
        userId: adminUser.userId, // Use the dynamically found Admin's ID
        jobcardId: newJobcard.jobcardId,
        sourceType: "Jobcard Request",
        message: `New medication request (Jobcard #${newJobcard.jobcardId}) requires approval.`,
        severity: "warning"
      }, { transaction: t });
    } else {
      // If no admin exists, log a warning but don't crash the application.
      console.warn("WARNING: A jobcard was created, but no 'Admin' user was found to receive the approval notification.");
    }

    return newJobcard;
  });
}

/**
 * Finds all jobcards with their related data, ordered by the most recent.
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
 * Finds a single jobcard by its ID with related data.
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
 * Updates a jobcard. If the status is changed to 'approved', this function
 * orchestrates checking inventory, creating consumption logs, and triggering the robot.
 * @param {number} jobcardId - The ID of the jobcard to update.
 * @param {object} updateData - The new data for the jobcard.
 * @returns {Promise<Jobcard>} The updated jobcard instance.
 */
async function updateJobcard(jobcardId, updateData) {
  // A transaction ensures that if any step fails (e.g., robot offline, not enough stock),
  // the entire operation is rolled back, preventing data corruption.
  return await sequelize.transaction(async (t) => {
    const jobcard = await Jobcard.findByPk(jobcardId, { transaction: t });
    if (!jobcard) {
      throw new Error("Jobcard not found.");
    }

    // --- MAIN APPROVAL LOGIC ---
    if (updateData.status === 'approved' && jobcard.status !== 'approved') {
      // 1. Get the full recipe for the jobcard's dilution.
      const jobcardWithRecipe = await Jobcard.findByPk(jobcardId, {
        include: { model: Dilution, include: { model: Formula, include: { model: FormulaDetail } } },
        transaction: t
      });

      const ingredients = jobcardWithRecipe.Dilution?.Formula?.FormulaDetails;
      if (!ingredients || ingredients.length === 0) {
        throw new Error("Approval failed: The formula for this dilution has no ingredients listed.");
      }

      // 2. Process each ingredient: Check stock, deduct, and log consumption.
      for (const ingredient of ingredients) {
        const stockItem = await Inventory.findByPk(ingredient.inventoryId, { transaction: t });
        if (!stockItem || stockItem.quantity < ingredient.requiredQuantity) {
          throw new Error(`Insufficient stock for item ID ${ingredient.inventoryId}. Required: ${ingredient.requiredQuantity}, Available: ${stockItem.quantity || 0}.`);
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

      // 3. --- ROBOT INTEGRATION ---
      try {
        console.log(`[Integration] Triggering robot for approved Jobcard #${jobcardId}...`);
        const form = new FormData();
        form.append('task', `Job-${jobcardId}-Dilution-Mix`);
        
        // Send POST request to the PHP container using its Docker service name.
        const robotApiResponse = await axios.post('http://robot-server/api/trigger.php', form, {
          headers: form.getHeaders()
        });
        console.log(`[Integration] Success! Robot task created with ID: ${robotApiResponse.data}`);
      } catch (error) {
        console.error("[Integration Error] FAILED to trigger robot:", error.message);
        // This is a critical failure. Throw an error to CANCEL the entire transaction.
        throw new Error("Could not trigger the robot. The robot service may be offline. Approval cancelled.");
      }

      // 4. Create a notification for the user who requested the jobcard.
      await Notification.create({
        userId: jobcard.userId,
        jobcardId: jobcard.jobcardId,
        sourceType: "Jobcard Approval",
        message: `Your medication request (Jobcard #${jobcard.jobcardId}) has been approved.`,
        severity: "info"
      }, { transaction: t });
    }

    // 5. Finally, apply the requested updates to the jobcard model.
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
  update: updateJobcard, // Alias 'update' to our detailed function for the controller.
  destroy
};