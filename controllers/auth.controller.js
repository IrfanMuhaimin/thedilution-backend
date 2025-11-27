const authService = require("../services/auth.service");
const { verifyToken } = require("../middleware/auth.jwt");

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

exports.logout = async (req, res) => {
  try {
    // We call the service function, which currently just returns a success message.
    const result = await authService.logoutUser();
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: "An error occurred during logout." });
  }
};