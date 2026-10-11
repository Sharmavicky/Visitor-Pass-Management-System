const Visitor = require("../Models/Visitor");

// @route POST /api/visitors
const createVisitor = async (req, res) => {
    try {
        const { name, email, phone, company, visitorType, idProofNumber, host } = req.body;

        // Create a new visitor instance
        const newVisitor = new Visitor({
            name,
            email,
            phone,
            company,
            visitorType,
            idProofNumber,
            host,
            photo: req.file ? req.file.path : "",
            createdBy: req.user._id,
        });

        await newVisitor.save();

        return res.status(201).json({
            success: true,
            message: "Visitor created successfully",
            data: newVisitor
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

// @route GET /api/visitors
const getVisitors = async (req, res) => {
    try {
        const visitors = await Visitor.find()
            .populate("host", "name email role")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: visitors.length,
            data: visitors
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

// @route GET /api/visitors/:id
const getVisitorById = async (req, res) => {
    try {
        const visitor = await Visitor.findById(req.params.id)
            .populate("host", "name email role");

        if (!visitor) {
            return res.status(400).json({
                success: false,
                message: "Visitor not found"
            })
        }

        return res.status(200).json({
            success: true,
            data: visitor
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

module.exports = { createVisitor, getVisitors, getVisitorById };