const express = require("express");
const router = express.Router();

const { getSummary,
    getDailyVisitors,
    getVisitorsByType,
    getPeakHours,
    getByDepartment,
    exportCSV
} = require("../Controllers/reportSummary");

const { verifyToken, authorizeRoles } = require("../Middleware/authMiddleware");

router.get("/summary", verifyToken, authorizeRoles("admin"), getSummary);
router.get("/daily", verifyToken, authorizeRoles("admin"), getDailyVisitors);
router.get("/by-type", verifyToken, authorizeRoles("admin"), getVisitorsByType);
router.get("/peak-hours", verifyToken, authorizeRoles("admin"), getPeakHours);
router.get("/by-department", verifyToken, authorizeRoles("admin"), getByDepartment);
router.get("/export", verifyToken, authorizeRoles("admin"), exportCSV);

module.exports = router;
