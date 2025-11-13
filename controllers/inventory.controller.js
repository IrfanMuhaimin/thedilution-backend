const inventoryService = require("../services/inventory.service");

exports.create = async (req, res) => {
  if (!req.body.name || req.body.quantity === undefined) {
    return res.status(400).send({ message: "Name and quantity are required." });
  }
  try {
    const newItem = await inventoryService.createInventory(req.body);
    res.status(201).send(newItem);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error creating inventory item." });
  }
};

exports.findAll = async (req, res) => {
  try {
    const items = await inventoryService.getAllInventory();
    res.status(200).send(items);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error retrieving inventory." });
  }
};

exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
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

exports.update = async (req, res) => {
  const id = req.params.id;
  try {
    const updatedItem = await inventoryService.updateInventory(id, req.body);
    if (updatedItem) {
      res.status(200).send(updatedItem);
    } else {
      res.status(404).send({ message: `Cannot update Inventory item with id=${id}.` });
    }
  } catch (err) {
    res.status(500).send({ message: "Error updating Inventory item with id=" + id });
  }
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await inventoryService.deleteInventory(id);
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(404).send({ message: `Cannot delete Inventory item with id=${id}.` });
    }
  } catch (err) {
    res.status(500).send({ message: "Could not delete Inventory item with id=" + id });
  }
};