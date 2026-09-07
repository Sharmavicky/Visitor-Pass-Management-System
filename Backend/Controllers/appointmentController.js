const Appointment = require("../Models/Appointment");
const Visitor = require("../Models/Visitor");

// @route POST /api/appointments
// @desc Create a new appointment
const createAppointment = async (req, res) => {
    try {
        const { visitorId, hostId, scheduledAt, purpose } = req.body;

        // Validate required fields
        if (!visitorId || !hostId || !scheduledAt || !purpose) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if visitor exists
        const visitorExists = await Visitor.findById(visitorId);
        if (!visitorExists) {
            return res.status(404).json({ message: "Visitor not found" });
        }

        // Create new appointment
        const newAppointment = new Appointment({
            visitor: visitorId,
            host: hostId,
            scheduledAt,
            purpose,
            createdBy: req.user._id
        });

        await newAppointment.save();

        res.status(201).json({
            success: true,
            message: "Appointment created successfully",
            appointment: newAppointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}