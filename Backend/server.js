const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./Config/dbConnection");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API is healthy"
    })
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});