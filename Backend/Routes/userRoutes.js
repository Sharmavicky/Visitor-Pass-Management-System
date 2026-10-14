const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../Middleware/authMiddleware");
const {
    getEmployees,
    updateProfile,
    changePassword,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} = require("../Controllers/userController");

// Profile routes
router.put("/profile", verifyToken, updateProfile);
router.put("/change-password", verifyToken, changePassword);

// Employee list
router.get("/employees", verifyToken, authorizeRoles("admin", "employee", "security", "visitor"), getEmployees);

// Admin only routes
router.get("/", verifyToken, authorizeRoles("admin"), getAllUsers);
router.post("/", verifyToken, authorizeRoles("admin"), createUser);
router.get("/:id", verifyToken, authorizeRoles("admin"), getUserById);
router.patch("/:id", verifyToken, authorizeRoles("admin"), updateUser);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteUser);

module.exports = router;