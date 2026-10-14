require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, "Please use a valid email address"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        minlength: [10, "Enter a valid 10 digit phone number"]
    },
    role: {
        type: String,
        enum: ["admin", "security", "visitor", "employee"],
        default: "visitor"
    },
    photo: {
        type: String,
        default: ""
    },
    department: {
        type: String,
        default: ""
    },
    company: {
        type: String,
        default: ""
    },
    jobTitle: {
        type: String,
        default: ""
    },
    baseLocation: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// pre-save hook for automatically password hashing
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
}

module.exports = mongoose.model("User", userSchema);