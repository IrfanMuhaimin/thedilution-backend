const userService = require("../services/user.service");

// POST /api/users
exports.create = async (req, res) => {
  // --- DEBUGGING LINE ---
  console.log("--- CREATE USER CONTROLLER HAS BEEN REACHED ---");
  // --- END DEBUGGING LINE ---

  if (!req.body.username || !req.body.password || !req.body.role) {
    return res.status(400).send({ message: "Username, password, and role are required." });
  }

  try {
    const newUser = {
      username: req.body.username,
      password: req.body.password,
      role: req.body.role,
      department: req.body.department,
      status: req.body.status || 'active',
      active: new Date()
    };

    const createdUser = await userService.createUser(newUser);
    createdUser.password = undefined; 
    res.status(201).send(createdUser);

  } catch (err) {
    res.status(500).send({
      message: err.message || "An error occurred while creating the User."
    });
  }
};

// GET /api/users
exports.findAll = async (req, res) => {
  // ... (rest of the file is the same)
  try {
    const users = await userService.getAllUsers();
    res.status(200).send(users);
  } catch (err) {
    res.status(500).send({ message: err.message || "Error retrieving users." });
  }
};

// GET /api/users/:id
exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await userService.getUserById(id);
    if (user) {
      res.status(200).send(user);
    } else {
      res.status(404).send({ message: `Cannot find User with id=${id}.` });
    }
  } catch (err) {
    res.status(500).send({ message: "Error retrieving User with id=" + id });
  }
};

// PUT /api/users/:id
exports.update = async (req, res) => {
  const id = req.params.id;
  try {
    const updatedUser = await userService.updateUser(id, req.body);
    if (updatedUser) {
        res.status(200).send(updatedUser);
    } else {
        res.status(404).send({ message: `Cannot update User with id=${id}.` });
    }
  } catch(err) {
    res.status(500).send({ message: "Error updating User with id=" + id });
  }
};

// DELETE /api/users/:id
exports.delete = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await userService.deleteUser(id);
        if (result) {
            res.status(200).send(result);
        } else {
            res.status(404).send({ message: `Cannot delete User with id=${id}.` });
        }
    } catch(err) {
        res.status(500).send({ message: "Could not delete User with id=" + id });
    }
};