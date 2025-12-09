// services/inventory.service.js
const db = require("../models");
const { Inventory, InventoryStock, User, sequelize } = db;

// Creates a new MASTER product, usually with an initial batch
async function createInventory(inventoryData) {
  const { name, unit, userId, initialStock } = inventoryData; // initialStock is { quantity, supplier, ... }

  return await sequelize.transaction(async (t) => {
    // Create the master product record
    const newInventory = await Inventory.create({
      name: name,
      unit: unit,
      userId: userId,
      quantity: initialStock.quantity || 0, // Set initial total quantity
      updateDate: new Date()
    }, { transaction: t });

    // If initial stock details are provided, create the first batch record
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
    if (!inventory) {
      throw new Error("Inventory item not found.");
    }

    await InventoryStock.create({
      inventoryId: inventoryId,
      quantity: stockData.quantity,
      supplier: stockData.supplier,
      expired: stockData.expired,
      batchNumber: stockData.batchNumber,
      updateDate: new Date()
    }, { transaction: t });

    await inventory.increment('quantity', { by: stockData.quantity, transaction: t });

    await inventory.update({ updateDate: new Date() }, { transaction: t });
    
    return await getInventoryById(inventoryId);
  });
}

async function getAllInventory() {
  return await Inventory.findAll({
    include: [
      { model: User, attributes: { exclude: ['password'] } },
      { model: InventoryStock }
    ]
  });
}

async function getInventoryById(id) {
  return await Inventory.findByPk(id, {
    include: [
      { model: User, attributes: { exclude: ['password'] } },
      { model: InventoryStock, order: [['updateDate', 'DESC']] } 
    ]
  });
}

async function updateInventory(inventoryId, updateData) {
  const inventory = await Inventory.findByPk(inventoryId);
  if (!inventory) {
    return null; // Return null if the item doesn't exist
  }

  // For safety, explicitly define which fields are allowed to be updated.
  // This prevents accidental changes to the 'quantity'.
  const allowedUpdates = {
    name: updateData.name,
    unit: updateData.unit,
    hardwarePort: updateData.hardwarePort, // <-- The field you need
    status: updateData.status,
    updateDate: new Date()
  };

  // Remove any undefined properties from the update object
  Object.keys(allowedUpdates).forEach(key => allowedUpdates[key] === undefined && delete allowedUpdates[key]);

  return await inventory.update(allowedUpdates);
}

async function deleteInventory(inventoryId) {
  return await sequelize.transaction(async (t) => {
    const inventory = await Inventory.findByPk(inventoryId, { transaction: t });
    if (!inventory) {
      throw new Error("Master inventory item not found.");
    }
    await InventoryStock.destroy({ where: { inventoryId: inventoryId }, transaction: t });

    await inventory.destroy({ transaction: t });

    return { message: "Master inventory product and all associated stock batches were deleted." };
  });
}

module.exports = {
  createInventory,
  addStock,
  getAllInventory,
  getInventoryById,
  updateInventory,
  deleteInventory // Ensure this is exported
};