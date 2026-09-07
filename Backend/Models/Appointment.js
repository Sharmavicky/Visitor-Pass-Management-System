const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    visitor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Visitor",
        required: [true, "Visitor is required"]
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Host",
        required: [true, "Host is required"]
    },
    scheduledAt: {
        type: String,
        required: [true, "Scheduled date and time is required"]
    },
    purpose: {
        type: String,
        required: [true, "Purpose of visit is required"]
    },
    status: {
        type: String,
        enum: ["pending", "rejected", "approved"],
        default: "pending"
    },
    rejectionReason: {
        type: String,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);