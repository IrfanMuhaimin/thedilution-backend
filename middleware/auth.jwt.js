const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.User;

const verifyToken = (req, res, next) => {
  let token = req.headers["authorization"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized! Invalid Token." });
    }
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  });
};

const isAdmin = (req, res, next) => {
    if (req.userRole && req.userRole === 'Admin') {
        next();
        return;
    }
    res.status(403).send({ message: "Require Admin Role!" });
};
// --- NEW MIDDLEWARE FUNCTION ---
const isPharmacist = (req, res, next) => {
    if (req.userRole && req.userRole === 'Pharmacist') {
        next();
        return;
    }
    res.status(403).send({ message: "Require Pharmacist Role!" });
};

// --- NEW MIDDLEWARE FUNCTION ---
const isDoctor = (req, res, next) => {
    if (req.userRole && req.userRole === 'Doctor') {
        next();
        return;
    }
    res.status(403).send({ message: "Require Doctor Role!" });
};

// A more flexible function: can be an Admin OR a Pharmacist
const isAdminOrPharmacist = (req, res, next) => {
    if (req.userRole && (req.userRole === 'Admin' || req.userRole === 'Pharmacist')) {
        next();
        return;
    }
    res.status(403).send({ message: "Require Admin or Pharmacist Role!" });
};


// CRITICAL: Update the exports to include the new functions
module.exports = {
  verifyToken,
  isAdmin,
  isPharmacist,
  isDoctor,
  isAdminOrPharmacist
};