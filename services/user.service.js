const db = require("../models");
const User = db.User;
const bcrypt = require("bcryptjs");

async function createUser(userData) {
  const hashedPassword = await bcrypt.hash(userData.password, 10); // 10 is the salt rounds
  const newUser = {
    ...userData,
    password: hashedPassword
  };

  return await User.create(newUser);
}

async function getAllUsers() {
  return await User.findAll();
}

async function getUserById(id) {
  const user = await User.findByPk(id);
  if (!user) {
    // We can throw a custom error or return null to be handled by the controller
    return null;
  }
  return user;
}

async function updateUser(id, userData) {
  const user = await User.findByPk(id);
  if (!user) {
    return null;
  }
  const updatedUser = await user.update(userData);
  return updatedUser;
}

async function deleteUser(id) {
  const user = await User.findByPk(id);
  if (!user) {
    return null;
  }
  await user.destroy();
  return { message: "User was deleted successfully." };
}


module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};