const express = require("express");
const router = express.Router();
const { verifyToken } = require("../Middleware/authMiddleware");
const { getEmployees } = require("../Controllers/employeeController");

router.get("/employees", verifyToken, getEmployees);