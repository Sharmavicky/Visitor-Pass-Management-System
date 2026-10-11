const express = require('express');
const router = express.Router();
const { createVisitor, getVisitors, getVisitorById } = require('../Controllers/visitorController');
const { verifyToken, authorizeRoles } = require('../Middleware/authMiddleware');
const upload = require('../Middleware/upload');

router.post('/', verifyToken, authorizeRoles('admin', 'security', 'employee'), upload.single('photo'), createVisitor);
router.get('/', verifyToken, authorizeRoles('admin', 'security'), getVisitors);
router.get('/:id', verifyToken, getVisitorById);

module.exports = router;