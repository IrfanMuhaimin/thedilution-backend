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

async function getUserProfile(userId) {
  return await User.findByPk(userId, {
    attributes: { exclude: ['password'] }
  });
}

async function updateUserProfile(userId, profileData) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error("User not found.");
  }

  if (profileData.password) {
    profileData.password = await bcrypt.hash(profileData.password, 10);
  }

  const allowedUpdates = {
    username: profileData.username,
    password: profileData.password,
    department: profileData.department,
    biometricHash: profileData.biometricHash
  };

  Object.keys(allowedUpdates).forEach(key => allowedUpdates[key] === undefined && delete allowedUpdates[key]);

  await user.update(allowedUpdates);

  return await getUserProfile(userId);
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile
};