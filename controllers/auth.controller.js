const authService = require("../services/auth.service");

exports.login = async (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res.status(400).send({ message: "Username and password are required." });
  }

  try {
    const user = await authService.loginUser(req.body);
    res.status(200).send(user);
  } catch (error) {
    // For security, give a generic error message
    res.status(401).send({ message: "Unauthorized: Invalid credentials." });
  }
};