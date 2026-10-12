const CheckLog = require("../Models/CheckLogs");
const Pass = require("../Models/Pass");
const Visitor = require("../Models/Visitor");

// @route POST /api/checklogs/check-in
// @access admin and security
const checkIn = async (req, res) => {
    try {
        const { token, location, notes } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "QR token is required"
            })
        }

        // find the pass by token
        const pass = await Pass.findOne({ token })
            .populate("visitor")
            .populate("appointment", "purpose scheduledAt")
            .populate("host", "name email")

        if (!pass) {
            return res.status(404).json({
                success: false,
                message: "Invalid QR token - pass not found"
            })
        }

        // check pass status
        if (pass.status === "revoked") {
            return res.status(400).json({
                success: false,
                message: "This pass has been revoked or not valid"
            })
        }

        if (pass.status === "expired" || pass.isExpired()) {
            pass.status = "expired";
            await pass.save();
            return res.status(403).json({
                success: false,
                message: "This pass has expired"
            })
        }

        // check if already checkedIn and not checkedOut
        const existingCheckIn = await CheckLog.findOne({
            pass: pass._id,
            action: "check-in"
        }).sort({ timestamp: -1 });

        const existingCheckOut = await CheckLog.findOne({
            pass: pass._id,
            action: "check-out"
        }).sort({ timestamp: -1 });

        if (existingCheckIn && (!existingCheckOut || existingCheckIn.timestamp > existingCheckOut.timestamp)) {
            return res.status(400).json({
                success: false,
                message: "Visitor is already checkedIn. Scan again to check-out",
                data: existingCheckIn
            })
        }

        // create check-in log
        const checkLog = await CheckLog.create({
            pass: pass._id,
            visitor: pass.visitor._id,
            appointment: pass.appointment?._id,
            action: "check-in",
            timestamp: new Date(),
            scannedBy: req.user._id,
            location: location || "Main Gate",
            tokenScanned: token,
            notes: notes || ""
        });

        // update pass stamp checkedInAt
        pass.checkedInAt = new Date();
        await pass.save();

        return res.status(200).json({
            success: true,
            message: "Check-in Successfull",
            data: {
                checkLog,
                visitor: {
                    name: pass.visitor.name,
                    email: pass.visitor.email,
                    phone: pass.visitor.phone,
                    company: pass.visitor.company,
                    photo: pass.visitor.photo,
                    visitorType: pass.visitor.visitorType,
                },
                pass: {
                    _id: pass._id,
                    status: pass.status,
                    validFrom: pass.validFrom,
                    validUntil: pass.validUntil,
                    host: pass.host,
                    purpose: pass.appointment?.purpose
                }
            }
        });
    } catch (error) {
        console.log("checkIn error: ", error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

// @route POST /api/checklogs/check-out
// @access admin and security
const checkOut = async (req, res) => {
    try {
        const { token, location, notes } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "QR token is required"
            })
        }

        // find pass 
        const pass = await Pass.findOne({ token })
            .populate("visitor")
            .populate("appointment", "purpose scheduledAt")

        if (!pass) {
            return res.status(404).json({
                success: false,
                message: "Invalid QR code - pass not found"
            })
        }

        // check if the pass was checked-in before check-out
        const lastCheckIn = await CheckLog.findOne({
            pass: pass._id,
            action: "check-in",
        }).sort({ timestamp: -1 });

        if (!lastCheckIn) {
            return res.status(400).json({
                success: false,
                message: "Visitor has not checked-in yet!!"
            })
        }

        // check if already checked-out after check-in
        const lastCheckOut = await CheckLog.findOne({
            pass: pass_id,
            action: "check-out"
        }).sort({ timestamp: -1 });

        if (lastCheckOut && lastCheckOut.timestamp > lastCheckIn.timestamp) {
            return res.status(404).json({
                success: false,
                message: "Visitor has already checked-out",
                data: lastCheckOut
            })
        }

        // create a checkout log
        const checkLog = await CheckLog.create({
            pass: pass_id,
            visitor: pass.visitor._id,
            appointment: pass.appointment?._id,
            action: "check-out",
            timestamp: new Date(),
            scannedBy: req.user._id,
            location: location || "Main Gate",
            tokenScanned: token,
            notes: notes || ""
        });

        // udpate pass
        pass.checkedOutAt = new Date();
        pass.status = "used";
        await pass.save();

        // Calculate duration
        const durationMs = new Date() - new Date(lastCheckIn.timestamp);
        const durationMinutes = Math.floor(durationMs / 60000);
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

        return res.status(200).json({
            success: true,
            message: "Check-out successfully",
            data: {
                checkLog,
                duration,
                visitor: {
                    name: pass.visitor.name,
                    company: pass.visitor.company,
                }
            }
        });
    } catch (error) {
        console.error("checkOut error:", error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// @route GET /api/checklogs
// @access admin and security
const getAllCheckLogs = async (req, res) => {
    try {
        const { action, date, visitorId } = req.query;

        const filter = {};

        if (action) filter.action = action;
        if (visitorId) filter.visitorId = visitorId;
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            filter.timestamp = { $gte: start, $lte: end };
        }

        const logs = await CheckLog.find(filter)
            .populate("visitor", "name email phone company photo")
            .populate("pass", "token status validFrom validUntil")
            .populate("appointment","purpose scheduledAt")
            .populate("scannedBy", "name role")
            .sort({ timestamp: -1 });

        return res.status(200).json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// @route GET /api/checklogs/active
// @access admin and security
// Returns all visitors currently on premises (checked in but not out)
const getActiveVisitors = async (req, res) => {
    try {
        // get all check-in logs
        const checkIns = await CheckLog.find({ action: "check-in" })
            .populate("visitor", "name email phone company photo visitorType")
            .populate("pass", "token status validFrom validUntil host")
            .populate("appointment","purpose scheduledAt")
            .populate("scannedBy", "name")
            .sort({ timestamp: -1 });

        const activeVisitors = [];

        // for each check-in see if there is a late check-out
        for (const log of checkIns) {
            const checkOut = await CheckLog.findOne({
                pass: log.pass._id,
                action: "check-out",
                timestamp: { $gt: log.timestamp }
            });

            // No checkout found — visitor is still on premises
            if (!checkOut) {
                // Calculate how long they've been in
                const durationMs = new Date() - new Date(log.timestamp);
                const durationMinutes = Math.floor(durationMs / 60000);
                const hours = Math.floor(durationMinutes / 60);
                const minutes = durationMinutes % 60;
                const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

                activeVisitors.push({
                    checkLog: log,
                    visitor: log.visitor,
                    pass: log.pass,
                    checkedIn: log.timestamp,
                    location: log.location,
                    duration
                });
            }
        }

        return res.status(200).json({
            success: true,
            count: activeVisitors.length,
            data: activeVisitors
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// @route GET /api/checklogs/visitor/:visitorId
// @access admin, security and visitor (own only)
const getVisitorCheckLogs = async (req, res) => {
    try {
        const { visitorId } = req.params;

        const logs = await CheckLog.find({ visitor: visitorId })
            .populate("pass", "token status validFrom validUntil")
            .populate("appointment", "purpose scheduledAt")
            .populate("scannedBy", "name role")
            .sort({ timestamp: -1 })
        
        return res.status(200).json({
            success: false,
            count: logs.length,
            data: logs
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = {
    checkIn,
    checkOut,
    getAllCheckLogs,
    getActiveVisitors,
    getVisitorCheckLogs
};