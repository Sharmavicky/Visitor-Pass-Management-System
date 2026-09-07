const jwt = require('jsonwebtoken');
const User = require("../Models/User");

// authentication middleware to verify JWT token and attach user to request
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided. Please login back!!"
            })
        }

        // Extract token from header
        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Account not found!!"
            })
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Account is inactive."
            })
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        // Handle token verification errors
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token. Access denied."
            })
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Your Session has expired. Please log in again."
            })
        }

        return res.status(500).json({
            success: false,
            message: "Server error. Please try again later."
        })
    }
};

// authorization middleware to check if user has required role(s) to access route
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not allowed to access this route`
            })
        }
        next();
    };
};

module.exports = { verifyToken, authorizeRoles };