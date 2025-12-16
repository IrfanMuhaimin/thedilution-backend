const db = require("../models");
const axios = require('axios');

const { 
    Jobcard, Dilution, Formula, FormulaDetail, Inventory, 
    User, Consumption, Notification, PrescriptionDetail, sequelize 
} = db;

// This will read the URL from your .env.development or .env file
const ROBOT_API_URL = process.env.ROBOT_API_URL;
if (!ROBOT_API_URL) {
    console.warn("WARNING: ROBOT_API_URL is not set. Robot execution will fail.");
}

// --- CREATE ---
async function create(data) {
    return await sequelize.transaction(async (t) => {
        const jobcardData = { ...data, status: 'requested', requestDate: new Date() };
        const newJobcard = await Jobcard.create(jobcardData, { transaction: t });
        const adminUser = await User.findOne({ where: { role: 'Admin' }, transaction: t });
        if (adminUser) {
            await Notification.create({
                userId: adminUser.userId, jobcardId: newJobcard.jobcardId, sourceType: "Jobcard Request",
                message: `New medication request (Jobcard #${newJobcard.jobcardId}) requires approval.`,
                severity: "warning"
            }, { transaction: t });
        }
        return newJobcard;
    });
}

// --- FIND ALL (READ) ---
async function findAll() {
    return await Jobcard.findAll({
        include: [
            { model: User, as: 'requester', attributes: { exclude: ['password'] } }, 
            { model: User, as: 'approver', attributes: { exclude: ['password'] } }, 
            { model: Dilution },
            { model: PrescriptionDetail }
        ],
        order: [['requestDate', 'DESC']]
    });
}

// --- FIND BY ID (READ) ---
async function findById(id) {
    return await Jobcard.findByPk(id, {
        include: [{ model: User, as: 'requester', attributes: { exclude: ['password'] } }, { model: User, as: 'approver', attributes: { exclude: ['password'] } }, { model: Dilution }, { model: PrescriptionDetail }]
    });
}

// --- UPDATE ---
async function update(jobcardId, updateData) {
    return await sequelize.transaction(async (t) => {
        const jobcard = await Jobcard.findByPk(jobcardId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!jobcard) throw new Error("Jobcard not found.");

        if (updateData.status === 'approved' && jobcard.status !== 'approved') {
            const jobcardWithRecipe = await Jobcard.findByPk(jobcardId, {
                include: { model: Dilution, include: { model: Formula, include: { model: FormulaDetail, include: [Inventory] } } },
                transaction: t
            });
            const ingredients = jobcardWithRecipe.Dilution?.Formula?.FormulaDetails;
            if (!ingredients || ingredients.length === 0) throw new Error("Approval failed: The formula has no ingredients.");

            for (const ingredient of ingredients) {
                const stockItem = await Inventory.findByPk(ingredient.inventoryId, { transaction: t, lock: t.LOCK.UPDATE });
                if (!stockItem || stockItem.quantity < ingredient.requiredQuantity) throw new Error(`Insufficient stock for item: ${stockItem.name}.`);
                await stockItem.decrement('quantity', { by: ingredient.requiredQuantity, transaction: t });
                await Consumption.create({
                    inventoryId: ingredient.inventoryId, jobcardId: jobcardId, formulaId: jobcardWithRecipe.Dilution.Formula.formulaId,
                    quantityUsed: ingredient.requiredQuantity, consumptionDate: new Date()
                }, { transaction: t });
            }
            await Notification.create({
                userId: jobcard.userId, jobcardId: jobcard.jobcardId, sourceType: "Jobcard Approval",
                message: `Your medication request (Jobcard #${jobcardId}) has been approved.`,
                severity: "info"
            }, { transaction: t });
        }
        return await jobcard.update(updateData, { transaction: t });
    });
}

// --- EXECUTE (NOW FULLY IMPLEMENTED) ---
async function executeJobcard(jobcardId) {
    if (!ROBOT_API_URL) {
        throw new Error("Robot API URL is not configured on the server. Cannot execute jobcard.");
    }

    return await sequelize.transaction(async (t) => {
        // 1. Fetch the complete jobcard, including its recipe and ingredients
        const jobcard = await Jobcard.findByPk(jobcardId, {
            include: { model: Dilution, include: { model: Formula, include: { model: FormulaDetail, include: [Inventory] } } },
            transaction: t,
            lock: t.LOCK.UPDATE // Lock the row to prevent other actions on it
        });

        // 2. Validate the jobcard
        if (!jobcard) throw new Error("Jobcard not found.");
        if (jobcard.status !== 'Approved') {
            throw new Error(`Cannot execute. Jobcard is in '${jobcard.status}' status, not 'Approved'.`);
        }

        const ingredients = jobcard.Dilution?.Formula?.FormulaDetails;
        if (!ingredients || ingredients.length === 0) {
            throw new Error("Execution failed: The formula has no ingredients.");
        }

        // 3. Construct the 'message' string for the robot
        const robotCommandString = ingredients.map(ing => {
            if (!ing.Inventory.hardwarePort) {
                throw new Error(`Execution failed: Ingredient '${ing.Inventory.name}' is not assigned to a hardware port.`);
            }
            const ingredientName = ing.Inventory.name.replace(/:|,/g, '');
            return `${ingredientName}:${ing.requiredQuantity}:${ing.Inventory.hardwarePort}`;
        }).join(',');

        try {
            const taskName = `Jobcard-${jobcard.jobcardId}-Dilution`;
            
            // 4. Create the body for the POST request
            const body = new URLSearchParams();
            body.append('task', taskName); // The name of the task
            
            // THIS IS THE ONLY LINE THAT SHOULD SEND THE RECIPE
            body.append('material', robotCommandString); 

            console.log(`[Robot API] Sending to trigger.php: task='${taskName}', material='${robotCommandString}'`);

            // 5. Make the API call to the robot server
            const response = await axios.post(`${ROBOT_API_URL}/trigger.php`, body, {
                responseType: 'text'
        });
            
            const newTaskId = parseInt(response.data);
            if (isNaN(newTaskId) || newTaskId <= 0) {
                throw new Error(`Robot API returned an invalid response: ${response.data}`);
            }

            console.log(`[Robot API] Success! Robot task created with ID: ${newTaskId}`);
            
            // 6. Update our local database to reflect the new status
            await jobcard.update({ status: 'Processing' }, { transaction: t });
            
            return { success: true, message: `Jobcard #${jobcardId} sent to robot for execution.`, robotTaskId: newTaskId };

        } catch (error) {
            // This detailed error handling will help debug any future issues
            let errorMessage = "Failed to trigger robot.";
            if (error.response) {
                console.error("[Robot API Error] The robot server responded with an error:", error.response.data);
                errorMessage = `Robot API responded with an error: ${error.response.data}`;
            } else if (error.request) {
                console.error("[Robot API Error] No response was received from the robot server.");
                errorMessage = "No response from Robot API. It may be offline or the URL is incorrect.";
            } else {
                console.error('[Robot API Error] An error occurred while setting up the request:', error.message);
            }
            throw new Error(errorMessage);
        }
    });
}

// --- DELETE ---
async function destroy(id) {
    const record = await Jobcard.findByPk(id);
    if (!record) return null;
    await record.destroy();
    return { message: "Jobcard deleted." };
}

module.exports = { create, findAll, findById, update, executeJobcard, destroy };