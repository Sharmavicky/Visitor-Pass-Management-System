const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    visitorType: {
        type: String,
        enum: ["Business", "Interview", "Vendor", "Personal", "Other"],
        required: [true, "Visitor type is required"],
        default: "Business"
    },
    idProofNumber: {
        type: String,
        required: [true, "ID proof number is required"],
        trim: true
    },
    photo: {
        type: String, // URL of the uploaded photo
        default: ""
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Host employee is required"]
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Creator is required"]
    }
}, { timestamps: true });

module.exports = mongoose.model("Visitor", visitorSchema);