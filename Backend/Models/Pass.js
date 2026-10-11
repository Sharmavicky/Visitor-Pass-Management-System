const mongoose = require("mongoose");

const passSchema = new mongoose.Schema({
    // which appointment this pass belong to 
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        required: [true, "Appointment is required"],
        unique: true,
    },

    // which visitor is associated with this pass
    visitor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Visitor",
        required: [true, "Visitor is required"],
    },

    // which host is associated with this pass
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Host is required"],
    },

    // qr token for the pass, security scans it and validates it from backend
    token: {
        type: String,
        required: [true, "QR token is required"],
        unique: true,
    },

    // Cloudinary Url of the generated QR code image for the pass
    qrCodeUrl: {
        type: String,
        default: "",
    },

    // validity period of the pass
    validFrom: {
        type: Date,
        required: [true, "Valid from date is required"],
    },
    validUntil: {
        type: Date,
        required: [true, "Valid to date is required"],
    },

    // Pass lifecycle status: active, expired, revoked
    status: {
        type: String,
        enum: ["active", "expired", "revoked"],
        default: "active"
    },

    // clearance zone info (pulled from appointment or set by admin)
    clearanceZone: {
        type: String,
        default: "Main Lobby & Common Areas",
    },

    accessAreas: {
        type: [String],
        default: ["Main Lobby", "Reception"],
    },

    // Who issued this pass (security/admin)
    issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Issuer is required"],
    },

    // timestamps for when the pass was checkedIn/Out 
    checkedInAt: {
        type: Date,
        default: null
    },
    checkedOutAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Auto-expire the pass after its validTo date
passSchema.methods.isExpired = function () {
    return new Date() > this.validTo;
}

// Index for fast token lookup
passSchema.index({ qrToken: 1 });

// Index for fast visitor pass lookup
passSchema.index({ visitor: 1, status: 1 });

module.exports = mongoose.model("Pass", passSchema);