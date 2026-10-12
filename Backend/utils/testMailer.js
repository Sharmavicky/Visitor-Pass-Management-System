require("dotenv").config();

const nodemailer   = require("nodemailer");
const transporter  = require("../Config/nodemailer");

const testMailer = async () => {

    // ── Check env vars before anything else ──────────────────
    const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
    const missing  = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        console.error("Missing required env variables:", missing.join(", "));
        process.exit(1);
    }

    try {
        // ── Send test email ───────────────────────────────────
        const info = await transporter.sendMail({
            from:    process.env.MAIL_FROM || process.env.SMTP_USER,
            to:      process.env.SMTP_USER,
            subject: `${process.env.APP_NAME || "VMS Pro"} — SMTP Test Email`,
            html: `
                <div style="font-family:Arial,sans-serif; max-width:500px; margin:auto; padding:24px;">
                    <h2 style="color:#102A4C;">Nodemailer is working!</h2>
                    <p>This is a test email from the Visitor Pass Management System.</p>
                    <p style="color:#64748b; font-size:13px;">
                        SMTP Host: <strong>${process.env.SMTP_HOST}</strong><br/>
                        SMTP Port: <strong>${process.env.SMTP_PORT}</strong><br/>
                        Sent At:   <strong>${new Date().toLocaleString()}</strong>
                    </p>
                </div>
            `,
        });

        console.log("✅ Test email sent successfully");
        console.log("   To:         ", process.env.SMTP_USER);
        console.log("   Message ID: ", info.messageId);

        // If using Ethereal (fake SMTP for dev testing), this gives a preview URL
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) console.log("   Preview URL:", previewUrl);

        process.exit(0);

    } catch (error) {
        console.error("❌ Mailer test failed:", error.message);
        process.exit(1);
    }
};

testMailer();