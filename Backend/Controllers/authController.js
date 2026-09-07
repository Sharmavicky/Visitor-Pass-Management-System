const User = require("../Models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @route  POST /api/auth/register
const registerUser = async (req, res) => {
    const { name, email, phone, password } = req.body;

    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        // create new user
        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT));

        const user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            role: "visitor" // hardcoded so that only visitor can register from the frontend. Admin, Security, and Employee accounts will be created by Admin only
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            token: generateToken(user._id),
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message || "Server error. Please try again later."
        })
    }
}

// @route  POST /api/auth/login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Account with this email does not exist"
            })
        }

        // Check if user account is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Your account is inactive."
            })
        }

        // check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token: generateToken(user._id),
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message || "Server error. Please try again later."
        })
    }
}

// @route GET /api/auth/me
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Account not found!!"
            })
        }

        return res.json({
            success: true,
            message: "Profile fetched successfully",
            user: req.user
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message || "Server error. Please try again later."
        })
    }
}

module.exports = { registerUser, loginUser, getMe };