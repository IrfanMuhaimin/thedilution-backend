const db = require("../models");
const { Inventory, User } = db;

async function createInventory(inventoryData) {
  return await Inventory.create(inventoryData);
}
async function getAllInventory() {
  return await Inventory.findAll({
    include: [{
      model: User,
      attributes: { exclude: ['password'] }
    }],
  });
}

async function getInventoryById(id) {
  return await Inventory.findByPk(id, {
    include: [{
      model: User,
      attributes: { exclude: ['password'] }
    }]
  });
}
async function updateInventory(id, inventoryData) {
  const item = await Inventory.findByPk(id);
  if (!item) return null;
  return await item.update(inventoryData);
}
async function deleteInventory(id) {
  const item = await Inventory.findByPk(id);
  if (!item) return null;
  await item.destroy();
  return { message: "Inventory item deleted successfully." };
}

module.exports = {
  createInventory,
  getAllInventory,
  getInventoryById,
  updateInventory,
  deleteInventory
};