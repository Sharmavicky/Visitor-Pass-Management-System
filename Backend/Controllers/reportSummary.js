const Appointment = require("../Models/Appointment");
const Visitor = require("../Models/Visitor");
const Pass = require("../Models/Pass");
const CheckLog = require("../Models/CheckLogs");
const User = require("../Models/User");
const { Parser } = require("json2csv");

// helper function for date-range selector
const getDateFilter = (startDate, endDate) => {
    const filter = {};
    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    return filter;
}

// @route GET /api/reports/summary
// @access admin only
const getSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const dateFilter = getDateFilter(startDate, endDate);

        const [
            totalVisitors,
            totalAppointments,
            pendingAppointments,
            approvedAppointments,
            rejectedAppointments,
            totalPasses,
            activePasses,
            revokedPasses,
            totalCheckIns,
            totalCheckOuts,
            totalStaff
        ] = await Promise.all([
            Visitor.countDocuments(dateFilter),
            Appointment.countDocuments(dateFilter),
            Appointment.countDocuments({ ...dateFilter, status: "pending" }),
            Appointment.countDocuments({ ...dateFilter, status: "approved" }),
            Appointment.countDocuments({ ...dateFilter, status: "rejected" }),
            Pass.countDocuments(dateFilter),
            Pass.countDocuments({ ...dateFilter, status: "active" }),
            Pass.countDocuments({ ...dateFilter, status: "revoked" }),
            CheckLog.countDocuments({ ...dateFilter, action: "check-in" }),
            CheckLog.countDocuments({ ...dateFilter, action: "check-out" }),
            User.countDocuments({ role: { $ne: "visitor" }, isActive: true })
        ]);

        // check-out rate
        const checkOutRate = totalCheckIns > 0 ? Math.round((totalCheckOuts / totalCheckIns) * 100) : 0;

        // approval rate
        const approvalRate = totalAppointments > 0 ? Math.round((approvedAppointments / totalAppointments) * 100) : 0;

        return res.status(200).json({
            success: true,
            data: {
                visitors: {
                    total: totalVisitors,
                },

                appointments: {
                    total: totalAppointments,
                    approved: approvedAppointments,
                    pending: pendingAppointments,
                    rejected: rejectedAppointments,
                    approvalRate: `${approvalRate}%`,
                },

                pass: {
                    total: totalPasses,
                    active: activePasses,
                    revoked: revokedPasses,
                },

                checkLogs: {
                    totalCheckIns,
                    totalCheckOuts,
                    checkOutRate: `${checkOutRate}%`,
                },

                staff: {
                    total: totalStaff,
                },
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// @route GET /api/reports/daily
// @access admin only
const getDailyVisitors = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const result = await CheckLog.aggregate([
            {
                $match: {
                    action: "check-in",
                    timestamp: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$timestamp",
                        },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            }
        ]);

        // Fill in missing days with 0
        const filledData = [];
        for (let i=0; i<days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split("T")[0];

            const found = result.find(r => r._id === dateStr);
            filledData.push({
                date: dateStr,
                count: found ? found.count : 0
            })
        }

        return res.status(200).json({
            success: true,
            days,
            data: filledData
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

// @route GET /api/reports/by-type
// @access admin only
// Return visitor count by grouped visitorType
const getVisitorsByType = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const dateFilter = getDateFilter(startDate, endDate);

        const result = await Visitor.aggregate([
            {
                $match: dateFilter,
            },
            {
                $group: {
                    _id: "$visitorType",
                    count: { $sum: 1 },
                }
            },
            {
                $sort: { count: -1 },
            }
        ]);

        const total = result.reduce((sum, r) => sum + r.count, 0);

        const data = result.map(r => ({
            type: r._id || "Unknown",
            count: r.count,
            percentage: total > 0 ? Math.round((r.count / total) * 100) : 0
        }));

        return res.status(200).json({
            success: true,
            total,
            data
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong" || err.message
        })
    }
}

// @route GET /api/reports/peak-hours
// @access admin only
// Return check-in count grouped by hours 
const getPeakHours = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = newDate();

        startDate.setDate(startDate.getDate() - days);

        const result = await CheckLog.aggregate([
            {
                $match: {
                    action: "check-in",
                    timestamp: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: { $hour: timestamp },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1},
            }
        ]);

        // Fill all 24 hours and missing hours get 0 as value
        const hours = Array.from({ length: 24 }, (_, i) => {
            const found = result.find(r => r.id === i);
            const label = i === 0 ? "12AM" : i < 12 ? `${i}AM` : i === "12" ? "12PM" : `${i - 12}PM`;

            return {
                hour: i,
                label,
                count: found ? found.count : 0
            }
        });

        return res.status(200).json({
            success: true,
            data: hours
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Something went wrong"
        })
    }
}

// @route GET /api/reports/by-department
// @access admin only
// Return appointment count grouped by host department
const getByDepartment = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const dateFilter = getDateFilter(startDate, endDate);

        const result = await Appointment.aggregate([
            {
                $match: dateFilter,
            },
            {
                $lookup: {
                    from: "users",
                    localField: "host",
                    foreignField: "_id",
                    as: "hostData"
                },
            },
            {
                $unwind: "$hostData",
            },
            {
                $group: {
                    _id: "$hostData.department",
                    count: { $sum: 1 }
                },
            },
            { $sort: { count: 1 } },
        ]);

        return res.status(200).json({
            success: true,
            data: result.map(r => ({
                department: r._id || "Unknown",
                count: r.count
            }))
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message || "Something went wrong"
        })
    }
}

// @route /api/reports/exports
// @access admin only
// Downloads full visitor log
const exportCSV = async (req, res) => {
    try {   
        const { startDate, endDate, status } = req.query;

        const filter = {};
        if (status) filter.status = status;

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const appointments = await Appointment.find(filter)
            .populate("visitor", "name email phone company visitorType idProofNumber")
            .populate("host", "name email department")
            .sort({ createdAt: -1 })

        // Shape data for csv
        const data = appointments.map(appt => ({
            "Appointment ID":   appt._id.toString(),
            "Visitor Name":     appt.visitor?.name        || "N/A",
            "Visitor Email":    appt.visitor?.email       || "N/A",
            "Visitor Phone":    appt.visitor?.phone       || "N/A",
            "Company":          appt.visitor?.company     || "N/A",
            "Visitor Type":     appt.visitor?.visitorType || "N/A",
            "ID Proof":         appt.visitor?.idProofNumber || "N/A",
            "Host Name":        appt.host?.name           || "N/A",
            "Host Email":       appt.host?.email          || "N/A",
            "Department":       appt.host?.department     || "N/A",
            "Purpose":          appt.purpose              || "N/A",
            "Status":           appt.status,
            "Scheduled At":     appt.scheduledAt
                ? new Date(appt.scheduledAt).toLocaleString("en-IN")
                : "N/A",
            "Created At":       new Date(appt.createdAt).toLocaleString("en-IN"),
        }))

        if (data.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No data found for the given filters"
            })
        }

        // convert to csv
        const parser = new Parser();
        const csv = parser.parse(csvData);

        const filename = `visitor-report-${Date.now()}.csv`;

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

        return res.status(200).send(csv);
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message || "Something went wrong"
        })
    }
};

module.exports = {
    getSummary,
    getDailyVisitors,
    getVisitorsByType,
    getPeakHours,
    getByDepartment,
    exportCSV,
};