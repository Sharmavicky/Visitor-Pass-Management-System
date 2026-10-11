require("dotenv").config();
const bcrypt   = require("bcryptjs");
const mongoose = require("mongoose");
const User     = require("./Models/User");

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    const newPassword = "Admin@123";  // new password 
    const hash        = await bcrypt.hash(newPassword, 10);

    const user = await User.findOneAndUpdate(
        { role: "admin" },             // finds your admin account
        { password: hash },
        { new: true }
    );

    if (user) {
        console.log(`✅ Password reset for: ${user.email}`);
        console.log(`   New password is:    ${newPassword}`);
    } else {
        console.log("❌ No admin user found");
    }

    await mongoose.disconnect();
    process.exit(0);
};

run();