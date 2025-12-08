// services/inventoryStock.service.js
const db = require("../models");
const { InventoryStock, Inventory, sequelize } = db;

// Note: Creation is handled by the `inventoryService.addStock` for atomicity.
// A direct create here would de-sync the total quantity.

// Find a single batch by its ID
async function findById(id) {
  return await InventoryStock.findByPk(id);
}

// Update a specific batch's details (e.g., supplier, batch number)
async function updateStock(stockId, stockData) {
  const stock = await InventoryStock.findByPk(stockId);
  if (!stock) {
    throw new Error("Inventory stock batch not found.");
  }
  
  // Note: We do not allow changing the quantity here as it would de-sync the total.
  // Quantity changes should be handled by a separate "adjust stock" transaction.
  const allowedUpdates = {
      supplier: stockData.supplier,
      expired: stockData.expired,
      batchNumber: stockData.batchNumber
  };

  return await stock.update(allowedUpdates);
}

// Delete a specific batch and update the master inventory total
async function deleteStock(stockId) {
  return await sequelize.transaction(async (t) => {
    const stock = await InventoryStock.findByPk(stockId, { transaction: t });
    if (!stock) {
      throw new Error("Inventory stock batch not found.");
    }

    const quantityToRemove = stock.quantity;
    const inventoryId = stock.inventoryId;

    // First, destroy the batch record
    await stock.destroy({ transaction: t });

    // Then, decrement the total on the master inventory record
    const inventory = await Inventory.findByPk(inventoryId, { transaction: t });
    if (inventory) {
      await inventory.decrement('quantity', { by: quantityToRemove, transaction: t });
    }

    return { message: "Inventory stock batch deleted successfully and total quantity updated." };
  });
}

module.exports = {
  findById,
  updateStock,
  deleteStock
};