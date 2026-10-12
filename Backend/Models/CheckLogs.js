const mongoose = require("mongoose");

const checkLogSchema = new mongoose.Schema({
    // which pass was scanned
    pass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pass",
        required: [true, "Pass reference is required"]
    },

    // which visitor checked in/out
    visitor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Visitor",
        required: [true, "Visitor reference is required"]
    },

    // which appointment this belongs
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        required: [true, "Appointment reference is required"]
    },

    // action performed 
    action: {
        type: String,
        enum: ["check-in", "check-out"],
        required: [true, "Action is required"]
    },

    // exact time of the action performed
    timestamp: {
        type: Date,
        default: Date.now
    },

    // who performed the scan
    scannedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "ScannedBy reference is required"]
    },

    // Where the scan happened
    location: {
        type:    String,
        default: "Main Gate",
    },

    // The QR token that was scanned — for audit trail
    tokenScanned: {
        type: String,
    },

    // Any notes added by security
    notes: {
        type:    String,
        default: "",
    },

}, { timestamps: true });

// Indexes for fast lookups
checkLogSchema.index({ pass:    1 });
checkLogSchema.index({ visitor: 1 });
checkLogSchema.index({ action:  1 });
checkLogSchema.index({ timestamp: -1 });  // latest first

module.exports = mongoose.model("CheckLog", checkLogSchema);
