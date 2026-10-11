const QRcode = require("qrcode");

/**
    * Generates a QR code for a visitor pass token
    * @param {string} qrToken - The unique UUID token for this pass
    * @param {object} options - Optional overrides for QR generation
    * @returns { buffer: Buffer, base64: string, dataUri: string }
*/

const generateQRCode = async (qrToken, options = {}) => {
    // validate input
    if (!qrToken || typeof qrToken !== "string") {
        throw new Error("QrToken must be a non-empty string"); 
    }

    try {
        const verifyUrl = `${process.env.FRONTEND_URL}/verify-pass/${qrToken}`;

        const qrBuffer = await QRcode.toBuffer(verifyUrl, {
            type: "png",
            width: options.width || 300,
            margin: options.margin || 2,
            errorCorrectionLevel: options.errorCorrectionLevel || "H",
            color: {
                dark:  options.darkColor  || "#0F1A2E",   // navy — matches app theme
                light: options.lightColor || "#FFFFFF",
            },
        })

        return {
            buffer: qrBuffer,
            base64: qrBuffer.toString("base64"),
            dataUri: `data:image/png;base64,${qrBuffer.toString("base64")}`,
        }
    } catch (error) {
            // Log everything about the error
            console.error("QR raw error:", error);
            console.error("QR error type:", typeof error);
            console.error("QR error message:", error?.message);
            console.error("QR error string:", String(error));
            throw new Error(`QR code generation failed: ${error?.message || String(error)}`);
    }
};

module.exports = generateQRCode;