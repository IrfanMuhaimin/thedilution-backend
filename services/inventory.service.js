// services/inventory.service.js
const db = require("../models");
const { Inventory, InventoryStock, User, sequelize } = db;
const { spawn } = require('child_process'); // Import the 'spawn' function

/**
 * A helper function to call the Python prediction script.
 * It's wrapped in a Promise to work cleanly with async/await.
 * @param {number} inventoryId - The ID of the inventory item.
 * @param {number} quantity - The current quantity of the item.
 * @returns {Promise<object>} - A promise that resolves with the prediction result from the Python script.
 */
function getPredictionForInventory(inventoryId, quantity) {
  return new Promise((resolve, reject) => {
    // Arguments to pass to the python script: the script path, inventoryId, and quantity
    const args = ['ai/predict.py', inventoryId, quantity];

    // Spawn a new child process to run the Python script.
    // 'python' should be in your system's PATH. Use 'python3' if needed.
    const pythonProcess = spawn('python', args);

    let result = '';
    let error = '';

    // Listen for data coming from the script's standard output (the JSON result)
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    // Listen for any errors that the script might print
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    // Listen for when the Python process exits
    pythonProcess.on('close', (code) => {
      // If the script exited with a non-zero code or printed an error, it failed.
      if (code !== 0 || error) {
        console.error(`[AI PREDICTION ERROR] Python script for ID ${inventoryId} exited with code ${code}. Error: ${error}`);
        return reject(new Error(`Python script failed: ${error}`));
      }
      try {
        // If successful, parse the JSON string result from the script
        const parsedResult = JSON.parse(result);
        resolve(parsedResult);
      } catch (e) {
        console.error(`[AI PARSE ERROR] Could not parse JSON from Python script. Output: ${result}`);
        reject(new Error('Failed to parse Python script output.'));
      }
    });

    // Handle initial spawn errors (e.g., 'python' command not found)
    pythonProcess.on('error', (err) => {
        console.error('[AI SPAWN ERROR] Failed to start Python process.', err);
        reject(new Error('Failed to start Python prediction process. Is Python installed and in the PATH?'));
    });
  });
}

// --- CRUD Functions ---

async function createInventory(inventoryData) {
  const { name, unit, userId, initialStock } = inventoryData;
  return await sequelize.transaction(async (t) => {
    const newInventory = await Inventory.create({
      name: name, unit: unit, userId: userId,
      quantity: initialStock.quantity || 0,
      updateDate: new Date()
    }, { transaction: t });

    if (initialStock && initialStock.quantity > 0) {
      await InventoryStock.create({
        inventoryId: newInventory.inventoryId,
        quantity: initialStock.quantity,
        supplier: initialStock.supplier,
        expired: initialStock.expired,
        batchNumber: initialStock.batchNumber,
        updateDate: new Date()
      }, { transaction: t });
    }
    return newInventory;
  });
}

async function addStock(inventoryId, stockData) {
  return await sequelize.transaction(async (t) => {
    const inventory = await Inventory.findByPk(inventoryId, { transaction: t });
    if (!inventory) throw new Error("Inventory item not found.");

    await InventoryStock.create({
      inventoryId: inventoryId, quantity: stockData.quantity,
      supplier: stockData.supplier, expired: stockData.expired,
      batchNumber: stockData.batchNumber, updateDate: new Date()
    }, { transaction: t });

    await inventory.increment('quantity', { by: stockData.quantity, transaction: t });
    await inventory.update({ updateDate: new Date() }, { transaction: t });
    return await getInventoryById(inventoryId);
  });
}

async function getAllInventory() {
  const items = await Inventory.findAll({
    include: [{ model: User, attributes: { exclude: ['password'] } }, { model: InventoryStock }]
  });

  if (!items) return [];

  const predictionPromises = items.map(item =>
    getPredictionForInventory(item.inventoryId, item.quantity)
      // Gracefully handle if one prediction fails so the whole page doesn't crash
      .catch(err => ({ inventoryId: item.inventoryId, predictedStockingDays: null, error: err.message }))
  );

  const predictions = await Promise.all(predictionPromises);
  const predictionsMap = new Map(predictions.map(p => [p.inventoryId, p]));

  const itemsWithPredictions = items.map(item => {
    const plainItem = item.get({ plain: true });
    const prediction = predictionsMap.get(item.inventoryId);
    plainItem.predictedStockingDays = prediction ? prediction.predictedStockingDays : null;
    return plainItem;
  });
  return itemsWithPredictions;
}

async function getInventoryById(id) {
  const item = await Inventory.findByPk(id, {
    include: [
      { model: User, attributes: { exclude: ['password'] } },
      { model: InventoryStock, order: [['updateDate', 'DESC']] }
    ]
  });

  if (!item) return null;

  const plainItem = item.get({ plain: true });
  try {
    const prediction = await getPredictionForInventory(item.inventoryId, item.quantity);
    plainItem.predictedStockingDays = prediction.predictedStockingDays;
  } catch (error) {
    console.error(`Could not get prediction for inventory item ${id}. Returning data without it.`);
    plainItem.predictedStockingDays = null;
    plainItem.predictionError = "The prediction service is currently unavailable.";
  }
  return plainItem;
}

async function updateInventory(inventoryId, updateData) {
  const inventory = await Inventory.findByPk(inventoryId);
  if (!inventory) return null;
  const allowedUpdates = {
    name: updateData.name, unit: updateData.unit,
    hardwarePort: updateData.hardwarePort,
    status: updateData.status, updateDate: new Date()
  };
  Object.keys(allowedUpdates).forEach(key => allowedUpdates[key] === undefined && delete allowedUpdates[key]);
  return await inventory.update(allowedUpdates);
}

async function deleteInventory(inventoryId) {
  return await sequelize.transaction(async (t) => {
    const inventory = await Inventory.findByPk(inventoryId, { transaction: t });
    if (!inventory) throw new Error("Master inventory item not found.");
    await InventoryStock.destroy({ where: { inventoryId: inventoryId }, transaction: t });
    await inventory.destroy({ transaction: t });
    return { message: "Master inventory product and all associated stock batches were deleted." };
  });
}

module.exports = {
  createInventory, addStock, getAllInventory,
  getInventoryById, updateInventory, deleteInventory
};