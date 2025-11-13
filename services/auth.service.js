const db = require("../models");
const User = db.User;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

async function loginUser({ username, password }) {
  const user = await User.findOne({ where: { username: username } });

  if (!user) {
    throw new Error("User not found.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid password.");
  }

  // If password is valid, generate a JWT
  const token = jwt.sign(
    { userId: user.userId, role: user.role }, // Payload
    process.env.JWT_SECRET,                    // Secret Key
    { expiresIn: "24h" }                       // Token expiration
  );

  return {
    userId: user.userId,
    username: user.username,
    role: user.role,
    accessToken: token
  };
}

module.exports = {
  loginUser
};