const Pass = require("../Models/Pass");
const Appointment = require("../Models/Appointment");
const Visitor = require("../Models/Visitor");
const generateQRCode = require("../utils/generateQRCode");
const generateQRCodePdf = require("../utils/generateVisitorPassPDF");
const sendPassEmail = require("../utils/sendPassEmail");
const cloudinary = require("../Config/cloudinary");
const { v4: uuidv4 } = require("uuid");

// Helper function to upload Qrcode buffer to cloudinary
const uploadQrToCloudinary = (buffer) => {
    return new Promise((reject, resolve) => {
        const stream = cloudinary.uploader.upload_stream({
            folder: "visitor-pass-system/qrcodes",
            format: "pdf",
            public_id: `qr-${Date.now()}`,
        }, (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
        })
        stream.end(buffer);
    })
};

// @route POST api/passes/issue/:appointmentId
// @access admin, security
const issuePass = async (req, res) => {
    try {
        // Get appointment with visitor and host populated
        const { appointmentId } = req.params;
        const appointment = await Appointment.findById(appointmentId)
            .populate("visitor")
            .populate("host", "name email")

        if (!appointment) {
            return res.status(400).json({
                success: false,
                message: "Appointment not found"
            })
        }

        // check if appointment if approved 
        if (appointment.status === !approved) {
            return res.status(400).json({
                success: false,
                message: "Appointment must be approved before issuing a pass"
            })
        }

        // check if there is a pass already for that appointment
        const existingPass = await Pass.findOne({ appointment: appointmentId });
        if (existingPass) {
            return res.status(400).json({
                success: false,
                message: "A pass has already been issued for this appointment",
                data: existingPass,
            })
        }

        // Generate unique token for qrCode
        const token = uuidv4();
        const qr = generateQRCode(token);

        // upload qr to cloudinary
        const qrCodeUrl = await uploadQrToCloudinary(qr.buffer);

        // validity window from the time of generation to end of same day
        const validFrom = new Date(appointment.scheduledAt);
        const validUntil = new Date(appointment.scheduledAt);
        validUntil.setHours(23, 59, 59, 999);

        // create pass in DB
        const pass = await Pass.create({
            appointment: appointment._id,
            visitor: appointment.visitor._id,
            host: appointment.host._id,
            token,
            qrCodeUrl,
            validFrom,
            validUntil,
            issuedBy: req.user._id,
            status: "active"
        });

        // Generate Pdf badge
        const passNumber = `VP-${pass._id.toString().slice(-8).toUpperCase()}`;

        const pdfBuffer = await generateQRCodePdf({
            passNumber,
            appointment: {
                purpose:     appointment.purpose,
                scheduledAt: appointment.scheduledAt,
                host:        appointment.host,
            },
            qrBuffer:  qr.buffer,
            validFrom,
            validUntil,
            status:    pass.status,
        })

        // Send email to visitor
        await sendPassEmail({
            email:       appointment.visitor.email,
            visitorName: appointment.visitor.name,
            passNumber,
            pdfBuffer,
            qrDataUri:   qr.dataUri,
            hostName:    appointment.host.name,
            purpose:     appointment.purpose,
            scheduledAt: appointment.scheduledAt,
        });

        return res.status(201).json({
            success: true,
            message: "Pass issued successfully and emailed to visitor",
            data:    pass,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to issue pass",
        })
    }
}

// @route GET api/passes
// @access admin, security
const getAllPasses = async (req, res) => {
    try {
        const { status, visitorId } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (visitorId) filter.visitor = visitorId;

        // Visitor must see only there passes
        if (req.user.role === "visitor") {
            // find visitor passed linked to there id
            const visitorDoc = await Visitor.findOne({ email: req.user.email });
            if (!visitorDoc) {
                return res.status(200).json({
                    success: true,
                    message: "No data found!!",
                    count: 0,
                    data: []
                })
            }
            filter.visitor = visitorDoc._id;
        }

        // extract passes
        const passes = await Pass.find(filter)
            .populate("visitor", "name email phone company")
            .populate("host", "name email")
            .populate("appointment", "purpose scheduledAt")
            .populate("issuedBy", "name")
            .sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            count: passes.length,
            data: passes
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

// @route GET /api/passes/:id
// @access admin, security and visitor (own only)
const getPassById = async (req, res) => {
    try {
        const { id } = req.params;

        // search for pass using passid
        const pass = await Pass.findById(id)
            .populate("visitor", "name email phone company")
            .populate("host", "name email")
            .populate("appointment", "purpose scheduledAt")
            .populate("issuedBy", "name")
            .sort({ createdAt: -1 })

        if (!pass) {
            return res.status(404).json({
                success: false,
                message: "No pass found",
            })
        }

        return res.status(200).json({
            success: true,
            message: "Pass found!",
            data: pass
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

// @route GET /api/passes/verify/:token
// @access - public when security scans Qr code
const verifyPass = async (req, res) => {
    try {
        const { token } = req.params;

        const pass = await Pass.findOne({ token })
            .populate("visitor", "name phone email company")
            .populate("host", "name email")
            .populate("appointment", "purpose scheduledAt");

        if (!pass) {
            return res.status(404).json({
                success: false,
                verified: false,
                message: "Invalid QR code - pass not found"
            });
        }

        // check if pass is expired
        if (pass.isExpired()) {
            pass.status = "expired";
            pass.save();

            return res.status(400).json({
                success: false,
                verified: false,
                message: "This pass has expired",
                data: pass
            })
        }

        // check if pass is revoked
        if (pass.status === "revoked") {
            return res.status(400).json({
                success:  false,
                verified: false,
                message:  "This pass has been revoked",
                data:     pass,
            });
        }

        return res.status(200).json({
            success: true,
            verified: true,
            message: "Pass verified successfully",
            data: pass
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}

// @route GET /api/passes/:id/pdf
// @access - visitor (own), admin and security
const downloadPassPdf = async (req, res) => {
    try {
        const pass = await Pass.findById(req.params.id)
            .populate("visitor",     "name email phone company idProofNumber visitorType")
            .populate("host",        "name email")
            .populate("appointment", "purpose scheduledAt");

        if (!pass) {
            return res.status(404).json({
                success: false,
                message: "Pass not found!!"
            })
        }

        const passNumber = `VP-${pass._id.toString().slice(-8).toUpperCase()}`;

        // generate qr code for pdf once more
        const qr = await generateQRCode(pass.qrToken);

        const pdfBuffer = await generateVisitorPassPDF({
            passNumber,
            visitor:     pass.visitor,
            appointment: {
                purpose:     pass.appointment?.purpose,
                scheduledAt: pass.appointment?.scheduledAt,
                host:        pass.host,
            },
            qrBuffer:   qr.buffer,
            validFrom:  pass.validFrom,
            validUntil: pass.validUntil,
            status:     pass.status,
        });

        res.setHeader("Content-Type",        "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="Visitor-Pass-${passNumber}.pdf"`);
        res.setHeader("Content-Length",      pdfBuffer.length);

        return res.end(pdfBuffer);
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}

// @route PATCH /api/passes/:id/revoke
// @access - admin only
const revokePass = async (req, res) => {
    try {
        const pass = await Pass.findById(req.params.id);

        if (!pass) {
            return res.status(404).json({
                success: false,
                message: "Pass not found!!"
            })
        }

        if (pass.status === "revoked") {
            return res.status(400).json({
                success: false,
                message: "Pass is already revoked"
            })
        }

        pass.status === "revoked";
        pass.save();

        return res.status(200).json({
            success: true,
            message: "Pass revoked successfully",
            data: pass
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}

module.exports = {
    issuePass,
    getAllPasses,
    getPassById,
    verifyPass,
    downloadPassPdf,
    revokePass
};