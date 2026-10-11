const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        // In dev, allow self-signed certs; in prod enforce strict TLS
        rejectUnauthorized: process.env.NODE_ENV === "production",
    },
});

// Verify connection on server startup
transporter.verify((error) => {
    if (error) {
        console.error("SMTP connection failed:", error.message);
    } else {
        console.log("SMTP server ready to send emails");
    }
});

module.exports = transporter;