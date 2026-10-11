const express = require("express");
const router = express.Router();
const {
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    approveAppointment,
    rejectAppointment
} = require("../Controllers/appointmentController");
const { verifyToken, authorizeRoles } = require("../Middleware/authMiddleware");

router.post("/", verifyToken, authorizeRoles("admin", "employee", "security"), createAppointment);
router.get("/", verifyToken, authorizeRoles("admin", "employee", "security"), getAllAppointments);
router.get("/:id", verifyToken, getAppointmentById);
router.patch("/:id/approve", verifyToken, authorizeRoles("admin", "employee"), approveAppointment);
router.patch("/:id/reject", verifyToken, authorizeRoles("admin", "employee"), rejectAppointment);

module.exports = router;