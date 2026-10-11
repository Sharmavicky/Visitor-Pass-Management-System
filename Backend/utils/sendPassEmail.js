const transporter = require("../Config/nodemailer");

const sendPassEmail = async ({
    email,
    visitorName,
    passNumber,
    pdfBuffer,
    hostName,
    purpose,
    scheduledAt,
    qrDataUri,
}) => {
    // ── Validation ──────────────────────────────────────────
    if (!email)      throw new Error("Visitor email is required");
    if (!passNumber) throw new Error("Pass number is required");
    if (!pdfBuffer)  throw new Error("Pass PDF buffer is required");

    if (!visitorName) {
        console.warn("sendPassEmail: visitorName not provided, using fallback");
    }

    // ── Format scheduled date ────────────────────────────────
    const formattedDate = scheduledAt
        ? new Date(scheduledAt).toLocaleDateString("en-IN", {
              day:    "numeric",
              month:  "long",
              year:   "numeric",
              hour:   "2-digit",
              minute: "2-digit",
              hour12: true,
          })
        : null;

    try {
        const mailOptions = {
            from:    process.env.MAIL_FROM || process.env.SMTP_USER,
            to:      email,
            subject: `Your Visitor Pass is Ready — ${passNumber}`,

            html: `
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    background: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                ">
                    <!-- Header -->
                    <div style="background: #102A4C; padding: 28px 32px;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <div style="
                                background: #ffffff;
                                width: 40px; height: 40px;
                                border-radius: 6px;
                                display: inline-flex;
                                align-items: center;
                                justify-content: center;
                                font-weight: bold;
                                color: #102A4C;
                                font-size: 14px;
                                line-height: 40px;
                                text-align: center;
                            ">VP</div>
                            <div>
                                <p style="color:#ffffff; font-size:16px; font-weight:bold; margin:0;">
                                    VMS Pro
                                </p>
                                <p style="color:#CBD5E1; font-size:11px; margin:0;">
                                    Visitor Pass Management
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Body -->
                    <div style="padding: 32px;">

                        <h2 style="color:#102A4C; margin-top:0; font-size:20px;">
                            Your Visitor Pass is Approved ✓
                        </h2>

                        <p style="color:#374151; font-size:14px;">
                            Hello <strong>${visitorName || "Visitor"}</strong>,
                        </p>

                        <p style="color:#374151; font-size:14px; line-height:1.6;">
                            Your appointment has been approved and your visitor pass
                            has been generated. Please find your pass details below
                            and the PDF attached to this email.
                        </p>

                        <!-- Pass details card -->
                        <div style="
                            background: #f8fafc;
                            border: 1px solid #e2e8f0;
                            border-radius: 8px;
                            padding: 20px;
                            margin: 24px 0;
                        ">
                            <table style="width:100%; border-collapse:collapse;">
                                <tr>
                                    <td style="padding: 8px 0; width: 40%;">
                                        <p style="margin:0; font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; font-weight:bold;">
                                            Pass Number
                                        </p>
                                        <p style="margin:4px 0 0; font-size:15px; font-weight:bold; color:#102A4C;">
                                            ${passNumber}
                                        </p>
                                    </td>
                                    ${hostName ? `
                                    <td style="padding: 8px 0;">
                                        <p style="margin:0; font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; font-weight:bold;">
                                            Your Host
                                        </p>
                                        <p style="margin:4px 0 0; font-size:15px; font-weight:bold; color:#0F172A;">
                                            ${hostName}
                                        </p>
                                    </td>
                                    ` : ""}
                                </tr>
                                ${purpose ? `
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <p style="margin:0; font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; font-weight:bold;">
                                            Purpose
                                        </p>
                                        <p style="margin:4px 0 0; font-size:14px; color:#0F172A;">
                                            ${purpose}
                                        </p>
                                    </td>
                                    ${formattedDate ? `
                                    <td style="padding: 8px 0;">
                                        <p style="margin:0; font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; font-weight:bold;">
                                            Scheduled At
                                        </p>
                                        <p style="margin:4px 0 0; font-size:14px; color:#0F172A;">
                                            ${formattedDate}
                                        </p>
                                    </td>
                                    ` : ""}
                                </tr>
                                ` : ""}
                            </table>
                        </div>

                        <!-- QR code -->
                        ${qrDataUri ? `
                        <div style="text-align:center; margin: 24px 0;">
                            <p style="font-size:12px; color:#64748b; margin-bottom:12px; text-transform:uppercase; letter-spacing:0.05em; font-weight:bold;">
                                Your QR Code — Scan at the Turnstile
                            </p>
                            <img
                                src="${qrDataUri}"
                                alt="Visitor QR Code"
                                width="180"
                                height="180"
                                style="border: 6px solid #f1f5f9; border-radius: 8px;"
                            />
                        </div>
                        ` : ""}

                        <!-- Instruction box -->
                        <div style="
                            background: #EFF6FF;
                            border-left: 4px solid #102A4C;
                            padding: 14px 16px;
                            border-radius: 4px;
                            margin: 24px 0;
                        ">
                            <p style="margin:0; font-size:13px; color:#1e40af; font-weight:bold;">
                                Instructions
                            </p>
                            <ul style="margin:8px 0 0; padding-left:20px; color:#374151; font-size:13px; line-height:1.8;">
                                <li>Present this email or the attached PDF at the security desk.</li>
                                <li>Carry a valid government-issued photo ID.</li>
                                <li>Scan the QR code at the turnstile kiosk for express entry.</li>
                                <li>Do not share your pass with anyone else.</li>
                            </ul>
                        </div>

                        <p style="color:#374151; font-size:14px;">
                            Regards,<br />
                            <strong>VMS Pro — Visitor Pass Management</strong>
                        </p>
                    </div>

                    <!-- Footer -->
                    <div style="
                        background: #f8fafc;
                        border-top: 1px solid #e2e8f0;
                        padding: 16px 32px;
                        text-align: center;
                    ">
                        <p style="margin:0; font-size:11px; color:#94a3b8;">
                            This is an automated email. Please do not reply.
                            If you have questions, contact the security desk directly.
                        </p>
                    </div>
                </div>
            `,

            attachments: [
                {
                    filename:    `Visitor-Pass-${passNumber}.pdf`,
                    content:     pdfBuffer,
                    contentType: "application/pdf",
                },
            ],
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Pass email sent to ${email} — Message ID: ${info.messageId}`);
        return info;

    } catch (error) {
        console.error(`Pass email failed for ${email}:`, error.message);
        throw error; // ✅ preserve original stack trace
    }
};

module.exports = sendPassEmail;