const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../Config/cloudinary");

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "visitor-pass-management/photos",
        allowed_formats: ["jpg", "jpeg", "png"],
        transformation: [{ width: 400, height: 400, crop: "fill" }],
    },
});

const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } }); // Limit file size to 2MB

module.exports = upload;