const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../Controllers/authController');
const { verifyToken } = require('../Middleware/authMiddleware');

router.post('/register', registerUser);     // Public route for user registration
router.post('/login', loginUser);           // Public route for user login
router.get('/me', verifyToken, getMe);     // Protected route to get current user info, requires authentication

module.exports = router;