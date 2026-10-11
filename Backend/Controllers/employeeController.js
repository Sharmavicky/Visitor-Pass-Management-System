import User from "../Models/userModel.js";

/* Get employees */
const getEmployees = async (req, res) => {
    try {
        const employees = await User.find({ role: "employee" }).select("name email", "-password").sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: employees.length,
            data: employees
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
};

module.exports = { getEmployees };