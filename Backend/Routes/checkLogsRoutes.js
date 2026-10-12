const express = require("express");
const router = express.Router();

const {
    checkIn,
    checkOut,
    getAllCheckLogs,
    getActiveVisitors,
    getVisitorCheckLogs
} = require("../Controllers/checkLogController");

const { verifyToken, authorizeRoles } = require("../Middleware/authMiddleware");

// Check-ins
router.post("/checkin", verifyToken, authorizeRoles("admin", "security"), checkIn);

// Check-out
router.post("/checkout", verifyToken, authorizeRoles("admin", "security"), checkOut);

// Get all logs
router.get("/", verifyToken, authorizeRoles("admin", "security"), getAllCheckLogs);

// Get currently active visitor on premises
router.get("/active", verifyToken, authorizeRoles("admin", "security"), getActiveVisitors);

// Get all logs for a specifi visitor
router.get("/visitor/:visitorId", verifyToken, authorizeRoles("admin", "security", "visitor"), getVisitorCheckLogs);

module.exports = router;