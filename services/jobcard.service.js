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
  User,
  Consumption,
  Notification,
  sequelize // We need this for database transactions
} = db;

/**
 * Creates a new jobcard and a notification for the approver.
 * @param {object} data - The jobcard data from the request body.
 * @returns {Promise<Jobcard>} The newly created jobcard instance.
 */
async function create(data) {
  // Use a transaction to ensure both the jobcard and notification are created successfully
  return await sequelize.transaction(async (t) => {
    // 1. Create the jobcard with initial status and date
    const jobcardData = {
      ...data,
      status: 'requested', // Set initial status
      requestDate: new Date()
    };
    const newJobcard = await Jobcard.create(jobcardData, { transaction: t });

    // 2. Automatically create a notification for the approver (e.g., an Admin with userId 1)
    const approverUserId = 1; // This should be dynamically determined in a real system
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

/**
 * Finds all jobcards with their related data.
 * @returns {Promise<Jobcard[]>} An array of all jobcards.
 */
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
      { model: Hardware },
      { model: Dilution },
      { model: PrescriptionDetail }
    ]
  });
}

/**
 * Updates a jobcard. This function contains the core integration logic.
 * If status is changed to 'approved', it deducts inventory and triggers the robot.
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

    // --- MAIN LOGIC BLOCK: This only runs when a jobcard is approved ---
    if (updateData.status === 'approved' && jobcard.status !== 'approved') {

      // 1. Get the full recipe for the jobcard's dilution
      const jobcardWithRecipe = await Jobcard.findByPk(jobcardId, {
        include: {
          model: Dilution,
          include: { model: Formula, include: { model: FormulaDetail } }
        },
        transaction: t
      });

      const ingredients = jobcardWithRecipe.Dilution?.Formula?.FormulaDetails;
      if (!ingredients || ingredients.length === 0) {
        throw new Error("Approval failed: The formula for this dilution has no ingredients listed.");
      }

      // 2. Process each ingredient: Check stock, deduct, and log consumption
      for (const ingredient of ingredients) {
        const stockItem = await Inventory.findByPk(ingredient.inventoryId, { transaction: t });
        
        // A. Check for sufficient stock
        if (!stockItem || stockItem.quantity < ingredient.requiredQuantity) {
          throw new Error(`Insufficient stock for item ID ${ingredient.inventoryId}. Required: ${ingredient.requiredQuantity}, Available: ${stockItem.quantity || 0}.`);
        }
        
        // B. Deduct the stock from inventory
        await stockItem.decrement('quantity', { by: ingredient.requiredQuantity, transaction: t });

        // C. Create a consumption record for tracking
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
        const taskName = `Job-${jobcardId}-Dilution-Mix`;
        form.append('task', taskName);

        // Send POST request to the PHP container using its Docker service name ('robot-server')
        const robotApiResponse = await axios.post('http://robot-server/api/trigger.php', form, {
          headers: form.getHeaders()
        });

        console.log(`[Integration] Success! Robot task created with ID: ${robotApiResponse.data}`);

      } catch (error) {
        console.error("[Integration Error] FAILED to trigger robot:", error.message);
        // This is a critical failure. We throw an error to CANCEL the entire transaction.
        // The inventory will be rolled back, and the jobcard will NOT be marked as approved.
        throw new Error("Could not trigger the robot. The robot service may be offline. Approval cancelled.");
      }

      // 4. Create a notification for the user who requested the jobcard
       await Notification.create({
        userId: jobcard.userId,
        jobcardId: jobcard.jobcardId,
        sourceType: "Jobcard Approval",
        message: `Your medication request (Jobcard #${jobcard.jobcardId}) has been approved and sent to the robot.`,
        severity: "info"
      }, { transaction: t });
    }

    // 5. Finally, apply the requested updates to the jobcard model
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
  update: updateJobcard, // Alias 'update' to our detailed function
  destroy
};