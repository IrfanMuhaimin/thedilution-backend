// controllers/inventory.controller.js
const inventoryService = require("../services/inventory.service");

exports.create = async (req, res) => {
  if (!req.body.name || !req.body.initialStock || req.body.initialStock.quantity === undefined) {
    return res.status(400).send({ message: "A 'name' and an 'initialStock' object with a 'quantity' are required." });
  }
  try {
    const newItem = await inventoryService.createInventory(req.body);
    res.status(201).send(newItem);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error creating inventory item." });
  }
};

exports.addStock = async (req, res) => {
  const inventoryId = req.params.id;
  if (!req.body || req.body.quantity === undefined || req.body.quantity <= 0) {
    return res.status(400).send({ message: "Stock data with a valid quantity is required." });
  }
  try {
    const updatedInventory = await inventoryService.addStock(inventoryId, req.body);
    res.status(200).send(updatedInventory);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error adding stock." });
  }
};

exports.findAll = async (req, res) => {
  try {
    // This call will now work because `inventoryService` is defined.
    const items = await inventoryService.getAllInventory();
    res.status(200).send(items);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error retrieving inventory." });
  }
};

exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
    // This call will now work.
    const item = await inventoryService.getInventoryById(id);
    if (item) {
      res.status(200).send(item);
    } else {
      res.status(404).send({ message: `Cannot find Inventory item with id=${id}.` });
    }
  } catch (err) {
    res.status(500).send({ message: "Error retrieving Inventory item with id=" + id });
  }
};

exports.update = (req, res) => {
  res.status(405).send({ message: "Direct updates are not allowed. Please use the 'add stock' endpoint." });
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await inventoryService.deleteInventory(id);
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message || "Could not delete master inventory item." });
  }
};