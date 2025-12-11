/**
 * This service handles all business logic for Jobcards.
 * On approval, it now triggers the robot's PHP script directly via the command line
 * for maximum reliability on the server.
 */

const db = require("../models");
// We no longer need axios for this integration.
// Instead, we use the built-in 'exec' function from Node's child_process module.
const { exec } = require('child_process');

// Destructure all the models we'll need for our operations
const {
  Jobcard,
  Dilution,
  Formula,
  FormulaDetail,
  Inventory,
  User,
  Consumption,
  Notification,
  PrescriptionDetail,
  sequelize
} = db;

// The create, findAll, and findById functions remain unchanged.
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
    return await Jobcard.findAll({
        include: [{ model: User, as: 'requester', attributes: { exclude: ['password'] } }, { model: User, as: 'approver', attributes: { exclude: ['password'] } }, { model: Dilution }, { model: PrescriptionDetail }],
        order: [['requestDate', 'DESC']]
    });
}

async function findById(id) {
    return await Jobcard.findByPk(id, {
        include: [{ model: User, as: 'requester', attributes: { exclude: ['password'] } }, { model: User, as: 'approver', attributes: { exclude: ['password'] } }, { model: Dilution }, { model: PrescriptionDetail }]
    });
}


/**
 * Updates a jobcard. On 'approved' status, it triggers the robot by executing a PHP script directly.
 */
async function updateJobcard(jobcardId, updateData) {
  return await sequelize.transaction(async (t) => {
    const jobcard = await Jobcard.findByPk(jobcardId, { transaction: t });
    if (!jobcard) {
      throw new Error("Jobcard not found.");
    }

    if (updateData.status === 'approved' && jobcard.status !== 'approved') {
      // Step 1: Get recipe (no changes here)
      const jobcardWithRecipe = await Jobcard.findByPk(jobcardId, {
        include: {
          model: Dilution,
          include: { model: Formula, include: { model: FormulaDetail, include: [Inventory] } }
        },
        transaction: t
      });

      const ingredients = jobcardWithRecipe.Dilution?.Formula?.FormulaDetails;
      if (!ingredients || ingredients.length === 0) {
        throw new Error("Approval failed: The formula has no ingredients listed.");
      }

      // Step 2: Process stock (no changes here)
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

      // Step 3: Format data string (no changes here)
      const formulaDataForRobot = ingredients.map(ing => {
        if (!ing.Inventory.hardwarePort) {
          throw new Error(`Approval failed: Ingredient '${ing.Inventory.name}' is not assigned to a hardware port.`);
        }
        const ingredientName = ing.Inventory.name.replace(/:|,/g, '');
        const requiredVolume = ing.requiredQuantity;
        const port = ing.Inventory.hardwarePort;
        return `${ingredientName}:${requiredVolume}:${port}`;
      }).join(',');

      // Step 4: --- NEW ROBOT INTEGRATION VIA COMMAND LINE EXECUTION ---
      try {
        console.log(`[Integration] Triggering robot for Jobcard #${jobcardId} via CLI...`);
        
        const taskName = `Job-${jobcardId}-Dilution-Mix`;
        
        // Sanitize data to prevent command injection issues.
        const sanitizedTaskName = `"${taskName.replace(/"/g, '\\"')}"`;
        const sanitizedMessage = `"${formulaDataForRobot.replace(/"/g, '\\"')}"`;
        
        // We build a shell command to execute the new PHP script.
        // Data is passed securely as environment variables.
        const command = `
          TASK_NAME=${sanitizedTaskName} \
          MESSAGE=${sanitizedMessage} \
          php /var/www/robot.thedilution.my/api/trigger_cli.php
        `;

        // We wrap the 'exec' call in a Promise to use it cleanly with async/await.
        await new Promise((resolve, reject) => {
          exec(command, (error, stdout, stderr) => {
            if (error) {
              console.error(`[Integration Error] exec error: ${error}`);
              return reject(error);
            }
            // The PHP script is designed to write errors to stderr.
            if (stderr) {
              console.error(`[Integration Error] PHP script stderr: ${stderr}`);
              return reject(new Error(stderr));
            }
            // stdout will contain the new task ID if successful.
            console.log(`[Integration] Success! Robot task created. Script output: ${stdout}`);
            resolve(stdout);
          });
        });

      } catch (error) {
        console.error("================================================================");
        console.error("[Integration Error] FAILED to execute PHP script.", error.message);
        console.error("================================================================");
        throw new Error("Could not trigger the robot. Approval cancelled.");
      }
      
      // Step 5: Create notification (no changes here)
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
