const PDFDocument = require("pdfkit");

// Consistent date formatter regardless of server locale
const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
        day:    "numeric",
        month:  "long",
        year:   "numeric",
        hour:   "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

const generateVisitorPassPDF = ({
    passNumber,
    visitor,
    appointment,
    qrBuffer,
    validFrom,
    validUntil,
    status = "active",
}) => {
    return new Promise((resolve, reject) => {

        // ── Input validation ──────────────────────────────────
        if (!visitor)                  return reject(new Error("Visitor data is required"));
        if (!appointment)              return reject(new Error("Appointment data is required"));
        if (!passNumber)               return reject(new Error("Pass number is required"));
        if (!validFrom || !validUntil) return reject(new Error("Valid from and valid until are required"));

        try {
            const doc = new PDFDocument({ size: "A4", margin: 0 });
            const chunks = [];

            doc.on("data",  (chunk) => chunks.push(chunk));
            doc.on("end",   ()      => resolve(Buffer.concat(chunks)));
            doc.on("error", (err)   => reject(err));

            const pageWidth = 595.28;

            // ── HEADER ────────────────────────────────────────
            doc.rect(0, 0, pageWidth, 105).fill("#102A4C");

            // Logo box
            doc.roundedRect(40, 30, 45, 45, 6).fill("#FFFFFF");
            doc.fillColor("#102A4C").font("Helvetica-Bold").fontSize(14)
                .text("VP", 40, 45, { width: 45, align: "center" });

            // App name
            doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(17)
                .text("Visitor Pass Management", 100, 32);
            doc.fillColor("#CBD5E1").font("Helvetica").fontSize(8)
                .text("Visitor Identity & Access Management", 100, 55);

            // Issue date (top right of header)
            doc.fillColor("#CBD5E1").font("Helvetica").fontSize(7)
                .text("ISSUED ON", 420, 32);
            doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(8)
                .text(formatDate(new Date()), 420, 44);

            // ── TITLE + STATUS ────────────────────────────────
            doc.fillColor("#102A4C").font("Helvetica-Bold").fontSize(23)
                .text("VISITOR PASS", 40, 130);
            doc.fillColor("#64748B").font("Helvetica").fontSize(9)
                .text("Authorized visitor access badge", 40, 160);

            // Status badge
            const statusColors = {
                active:  "#16A34A",
                used:    "#6B7280",
                expired: "#DC2626",
                revoked: "#DC2626",
            };
            doc.roundedRect(400, 128, 155, 28, 4)
                .fill(statusColors[status] || "#16A34A");
            doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(9)
                .text(`● ${status.toUpperCase()}`, 400, 138, { width: 155, align: "center" });

            // ── PASS NUMBER ───────────────────────────────────
            doc.roundedRect(40, 195, 515, 55, 6).fill("#F1F5F9");
            doc.fillColor("#64748B").font("Helvetica").fontSize(8)
                .text("PASS NUMBER", 58, 209);
            doc.fillColor("#102A4C").font("Helvetica-Bold").fontSize(14)
                .text(passNumber, 58, 224);

            // ── VISITOR DETAILS ───────────────────────────────
            doc.fillColor("#102A4C").font("Helvetica-Bold").fontSize(11)
                .text("Visitor Details", 40, 282);

            // Row 1: Name + Company
            doc.fillColor("#64748B").font("Helvetica").fontSize(8).text("NAME", 40, 308);
            doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(11)
                .text(visitor.name || "N/A", 40, 322);

            doc.fillColor("#64748B").font("Helvetica").fontSize(8).text("COMPANY", 300, 308);
            doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(11)
                .text(visitor.company || "N/A", 300, 322);

            // Row 2: Phone + Email
            doc.fillColor("#64748B").font("Helvetica").fontSize(8).text("PHONE", 40, 358);
            doc.fillColor("#0F172A").font("Helvetica").fontSize(10)
                .text(visitor.phone || "N/A", 40, 372);

            doc.fillColor("#64748B").font("Helvetica").fontSize(8).text("EMAIL", 300, 358);
            doc.fillColor("#0F172A").font("Helvetica").fontSize(10)
                .text(visitor.email || "N/A", 300, 372);

            // Row 3: Visitor type + ID proof
            doc.fillColor("#64748B").font("Helvetica").fontSize(8).text("VISITOR TYPE", 40, 408);
            doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(10)
                .text(visitor.visitorType || "N/A", 40, 422);

            doc.fillColor("#64748B").font("Helvetica").fontSize(8).text("ID PROOF NUMBER", 300, 408);
            doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(10)
                .text(visitor.idProofNumber || "N/A", 300, 422);

            // Divider
            doc.moveTo(40, 455).lineTo(555, 455)
                .strokeColor("#E2E8F0").lineWidth(0.5).stroke();

            // ── APPOINTMENT DETAILS ───────────────────────────
            doc.fillColor("#102A4C").font("Helvetica-Bold").fontSize(11)
                .text("Appointment Details", 40, 468);

            // Host + Purpose
            doc.fillColor("#64748B").font("Helvetica").fontSize(8).text("HOST / SPONSOR", 40, 492);
            doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(11)
                .text(appointment.host?.name || "N/A", 40, 506);

            doc.fillColor("#64748B").font("Helvetica").fontSize(8).text("PURPOSE", 300, 492);
            doc.fillColor("#0F172A").font("Helvetica").fontSize(10)
                .text(appointment.purpose || "N/A", 300, 506, { width: 220 });

            // Scheduled at
            doc.fillColor("#64748B").font("Helvetica").fontSize(8).text("SCHEDULED AT", 40, 538);
            doc.fillColor("#0F172A").font("Helvetica").fontSize(10)
                .text(
                    appointment.scheduledAt ? formatDate(appointment.scheduledAt) : "N/A",
                    40, 552
                );

            // Divider
            doc.moveTo(40, 578).lineTo(555, 578)
                .strokeColor("#E2E8F0").lineWidth(0.5).stroke();

            // ── VALIDITY ──────────────────────────────────────
            doc.roundedRect(40, 588, 515, 65, 6).fill("#F8FAFC");

            doc.fillColor("#64748B").font("Helvetica").fontSize(8).text("VALID FROM", 58, 603);
            doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(9)
                .text(formatDate(validFrom), 58, 618);

            doc.fillColor("#64748B").font("Helvetica").fontSize(8).text("VALID UNTIL", 300, 603);
            doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(9)
                .text(formatDate(validUntil), 300, 618);

            // ── QR CODE ───────────────────────────────────────
            doc.fillColor("#102A4C").font("Helvetica-Bold").fontSize(11)
                .text("Scan to Verify", 40, 680);

            if (qrBuffer) {
                doc.image(qrBuffer, 40, 702, { width: 110, height: 110 });
            } else {
                doc.rect(40, 702, 110, 110).stroke("#E2E8F0");
                doc.fillColor("#94A3B8").font("Helvetica").fontSize(8)
                    .text("QR code\nnot available", 40, 745, { width: 110, align: "center" });
            }

            doc.fillColor("#64748B").font("Helvetica").fontSize(8)
                .text("Present this pass at the security desk.", 170, 710, { width: 360 });
            doc.text(
                "The QR code can be scanned at any turnstile kiosk to verify visitor access.",
                170, 728, { width: 360 }
            );
            doc.text(
                `Pass ID: ${passNumber}`,
                170, 752, { width: 360 }
            );

            // ── FOOTER ────────────────────────────────────────
            doc.moveTo(40, 820).lineTo(555, 820)
                .strokeColor("#E2E8F0").stroke();

            doc.fillColor("#94A3B8").font("Helvetica").fontSize(7)
                .text(
                    "Visitor Pass Management  •  Secure Visitor Access  •  Unauthorized use is prohibited",
                    40, 828,
                    { width: 515, align: "center" }
                );

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = generateVisitorPassPDF;