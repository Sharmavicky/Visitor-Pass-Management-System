const Appointment = require("../Models/Appointment");
const Visitor = require("../Models/Visitor");
const Pass = require("../Models/Pass");
const User = require("../Models/User");
const generateQRCode = require("../utils/generateQRCode");
const generateVisitorPassPDF = require("../utils/generateVisitorPassPDF");
const sendPassEmail = require("../utils/sendPassEmail");
const cloudinary = require("../Config/cloudinary");
const { v4: uuidv4 } = require("uuid");

// Helper function to upload same as Pass Controller
const uploadQRToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
                folder:    "visitor-pass-system/qrcodes",
                format:    "png",
                public_id: `qr-${Date.now()}`,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        stream.end(buffer);
    });
};

// @route POST /api/appointments
// @desc Create a new appointments
const createAppointment = async (req, res) => {
    console.log("createAppointment called");
    console.log("req.body:", req.body);
    console.log("req.user:", req.user);

    try {
        const { visitor, host, scheduledAt, purpose } = req.body;

        console.log("visitor:", visitor);
        console.log("host:", host);
        console.log("scheduledAt:", scheduledAt);
        console.log("purpose:", purpose);

        // Validate required fields
        if (!visitor || !host || !scheduledAt || !purpose) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if visitor exists
        const visitorExists = await Visitor.findById(visitor);
        if (!visitorExists) {
            return res.status(404).json({ message: "Visitor not found" });
        }

        // Create new appointment
        const newAppointment = new Appointment({
            visitor,
            host,
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

// @route PATCH /api/appointments/:id/approve
// @access employee (only if host), admin
const approveAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate("visitor")
            .populate("host", "name email")

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            })
        }

        // Only the assigned host or admin can approve
        if (req.user.role !== "admin" && appointment.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You're not authorized to approve this appointment"
            })
        }

        if (appointment.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: `Appointment is already ${appointment.status}`
            })
        }

        appointment.status = "approved";
        appointment.save();

        // Auto-issue pass
        try {
            // Generate token + QR
            const token = uuidv4();
            const qr = await generateQRCode(token);

            // Upload Qr to cloudinary
            const qrCodeUrl = await uploadQRToCloudinary(qr.buffer);

            // set validity window
            const validFrom = new Date(appointment.scheduledAt);
            const validUntil = new Date(appointment.scheduledAt);
            validUntil.setHours(23, 59, 59, 999);

            // save pass to DB
            const pass = await Pass.create({
                appointment: appointment._id,
                visitor: appointment.visitor._id,
                host: appointment.host._id,
                token,
                qrCodeUrl,
                validFrom,
                validUntil,
                issuedBy: req.user._id,
                status: "active",
            })

            // Generate PDF
            const passNumber = `VP-${pass._id.toString().slice(-8).toUpperCase()}`;

            const pdfBuffer = await generateVisitorPassPDF({
                passNumber,
                visitor:     appointment.visitor,
                appointment: {
                    purpose:     appointment.purpose,
                    scheduledAt: appointment.scheduledAt,
                    host:        appointment.host,
                },
                qrBuffer:  qr.buffer,
                validFrom,
                validUntil,
                status:    "active",
            });

            // Send email to visitor
            await sendPassEmail({
                email: appointment.visitor.email,
                visitorName: appointment.visitor.name,
                passNumber,
                pdfBuffer,
                qrDataUri: qr.dataUri,
                hostName: appointment.host.name,
                purpose: appointment.purpose,
                scheduledAt: appointment.scheduledAt,
            });

            console.log(`Pass ${passNumber} issued and emailed to ${appointment.visitor.email}`);
        } catch (passError) {
            console.error("Auto pass generation failed: ", passError.message);
        }

        return res.status(200).json({
            success: true,
            message: "Appointment approved - pass issue and emailed to visitor",
            data: appointment,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}

// @route PATCH /api/appointments/:id/reject
// @access employee (only if host), admin
const rejectAppointment = async (req, res) => {
    try {
        const { reason } = req.body;
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            })
        }

        if (req.user.role !== admin && appointment.host.toString !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You're not authorized to reject the appointment"
            })
        }

        if (appointment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Appointment is already ${appointment.status}`
            });
        }

        appointment.status = "rejected";
        appointment.rejectionReason = reason || "";
        appointment.save();

        return res.status(200).json({
            success: true,
            message: "Appointment rejected successfully",
            data: appointment,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}

// @route GET /api/appointments
// @access admin, security, employee (employee sees only their own as host)
const getAllAppointments = async (req, res) => {
    try {
        let filter = {};

        // Employess only see appointments where they are the host
        if (req.user.role === "employee") {
            filter.host = req.user._id;
        }

        // Optional status filter: /api/appointments?status=pending
        if (req.query.status) {
            filter.status = req.query.status;
        }

        const appointments = await Appointment.find(filter)
            .populate("visitor", "name email phone company photo")
            .populate("host", "name email role")
            .sort({ scheduledAt: 1 });

        return res.status(200).json({
            success: true,
            count: appointment.length,
            data: appointment,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}

// @route GET /api/appointments/:id
// @access admin, security, employee (employee sees only their own as host)

const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate("visitor", "name email phone company photo idProofNumber")
            .populate("host", "name email role");

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found!!"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Appointment Found successfully",
            data: appointment,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}

module.exports = {
    createAppointment,
    approveAppointment,
    rejectAppointment,
    getAllAppointments,
    getAppointmentById
};