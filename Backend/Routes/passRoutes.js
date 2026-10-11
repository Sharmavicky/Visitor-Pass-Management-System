const express = require("express");
const router = express.Router();

const {
    issuePass,
    getAllPasses,
    getPassById,
    verifyPass,
    downloadPassPdf,
    revokePass
} = require("../Controllers/passController")
const { verifyToken, authorizeRoles } = require("../Middleware/authMiddleware");

// Public — QR scanner on the verify page doesn't need a login
router.get("/verify/:token", verifyPass);

// Protected Routes
router.post("/issue/appointmentId", verifyToken, authorizeRoles("admin", "security"), issuePass);
router.get("/", verifyToken, authorizeRoles("admin", "security", "visitor"), getAllPasses);
router.get("/:id", verifyToken, authorizeRoles("admin", "security", "visitor"), getPassById);
router.get("/:id/pdf", verifyToken, authorizeRoles("admin", "security", "visitor"), downloadPassPdf);
router.get("/:id/revoke", verifyToken, authorizeRoles("admin"), revokePass);

module.exports = router;