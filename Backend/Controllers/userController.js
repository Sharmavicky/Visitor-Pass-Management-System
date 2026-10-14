const User = require("../Models/User");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// @route GET /api/users/employees
// @access visitor, employee and admin (for pre-registration)
const getEmployees = async (req, res) => {
    try {
        const employee = await User.find({
            role: "employee",
            isActive: true
        }).select("name email role department");

        return res.status(200).json({
            success: true,
            count: employee.length,
            data: employee
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// @route GET /api/users
// @access admin only
const getAllUsers = async (req, res) => {
    try {
        const { role, isActive, search } = req.query;

        const filter = {};

        if (role) filter.role = role;
        if (isActive) filter.isActive = isActive === "true";

        // Search by name or email
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const users = await User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// @route GET /api/users/:id
// @access admin only
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id!!"
            })
        }

        const user = await User.findById(id)
            .select("-password")

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found!!"
            })
        }

        return res.status(200).json({
            success: true,
            data: user
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// @route POST /api/users
// @access admin only - creates staff account (security, admin and employee)
const createUser = async (req, res) => {
    try {
        const { name, email, role, department, phone, password } = req.body;

        if (!name || !email || !phone || !password || !role || !department) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password, phone and role are required"
            })
        }

        // Only allow staff role - visitor (self-register)
        const allowedRoles = ["admin", "security", "employee"];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be admin, security or employee"
            })
        }

        // validate password and email
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be atleast 6 characters!!"
            })
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "An account with this email already exists!!"
            })
        }

        // create a new user
        const user = await User.create({
            name,
            email,
            password,
            role,
            department: department || "",
            phone: phone || "",
            isActive: true
        });

        return res.status(200).json({
            success: true,
            message: `${role} account created successfully!!`,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                phone: user.phone,
                isActive: user.isActive,
                createdAt: user.createdAt,
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// @route PATCH /api/users/:id
// @access admin only
const updateUser = async (req, res) => {
    try {
        const { name, phone, role, department, isActive } = req.body;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id!!"
            })
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found!!"
            })
        }

        // Prevent admin to deactivating there own account
        if (req.params.id === req.user._id.toString() && isActive === false) {
            return res.status(400).json({
                success: false,
                message: "You cannot deactivate your own account!!"
            })
        }

        // Only update fields that were sent
        if (name !== undefined) user.name = name;
        if (role !== undefined) user.role = role;
        if (department !== undefined) user.department = department;
        if (phone !== undefined) user.phone = phone;
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "User updated successfully!!",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                phone: user.phone,
                isActive: user.isActive,
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// @route DELETE /api/users/:id
// @access admin only - safe delete (de-activate account) not hard delete
const deleteUser = async (req, res) => {
    try {
        const { id} = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user-id!!"
            })
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found!!"
            })
        }

        // Prevent admin from deleting themselves
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot delete your own account"
            })
        }

        user.isActive = false;
        await user.save();

        return res.status(200).json({
            success: false,
            message: "Account deactivated successfully!!"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// @route PUT /api/users/profile
// @access all roles - update there own profile
const updateProfile = async (req, res) => {
    try {
        const { name, phone, company, jobTitle, baseLocation } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name is required"
            })
        }

        const user = await User.findById( req.user._id );
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        if (name !== undefined) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (company !== undefined) user.company = company;
        if (jobTitle !== undefined) user.jobTitle = jobTitle;
        if (baseLocation !== undefined) user.baseLocation = baseLocation;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                company: user.company,
                jobTitle: user.jobTitle,
                baseLocation: user.baseLocation,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// @route PUT /api/users/change-password
// @access all roles - change password for there profile
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            })
        }

        // validate newPassword
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must atleast 6 characters!!"
            })
        }

        const user = await User.findById(req.user._id).select("+password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found!!"
            })
        }

        // verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            })
        }

        // check if both current and new password is same
        const isSame = await bcrypt.compare(currentPassword, newPassword);
        if (isSame) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from current password",
            });
        }

        // Pre-save hook will hash the new password
        user.password = newPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

module.exports = {
    getEmployees,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updateProfile,
    changePassword,
};