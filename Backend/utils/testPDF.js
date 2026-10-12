const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const generateQRCode = require("./qrGenerator");
const generateVisitorPassPDF = require("./pdfGenerator");


const testPDF = async () => {

    try {

        // Generate test QR token
        const qrToken = uuidv4();

        // Generate QR image
        const qrBuffer = await generateQRCode(qrToken);


        // Test visitor data
        const visitor = {
            name: "Test Visitor",
            email: "test@example.com",
            phone: "9876543210",
            company: "Test Company",
            visitorType: "Business"
        };


        // Test appointment data
        const appointment = {
            purpose: "Business Meeting",
            scheduledAt: "15 September 2026, 10:00 AM"
        };


        // Generate PDF
        const pdfBuffer = await generateVisitorPassPDF({

            passNumber: "VP-TEST-001",

            visitor,

            appointment,

            qrBuffer,

            validFrom: new Date(),

            validUntil: new Date(
                Date.now() + 2 * 60 * 60 * 1000
            )

        });


        // Save PDF temporarily
        fs.writeFileSync(
            "test-visitor-pass.pdf",
            pdfBuffer
        );


        console.log(
            "Visitor pass PDF generated successfully."
        );

        console.log(
            "Saved as test-visitor-pass.pdf"
        );

    } catch (error) {

        console.error(
            "PDF generation failed:",
            error.message
        );

    }
};


testPDF();