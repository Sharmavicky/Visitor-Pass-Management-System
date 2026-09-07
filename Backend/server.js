const dotenv = require("dotenv");
dotenv.config();

// Import required modules
const express = require("express");
const cors = require("cors");

// Import routes and database connection
const connectDB = require("./Config/dbConnection");
const authRoutes = require("./Routes/authRoutes");
const visitorRoutes = require("./Routes/visitorRoutes");


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

// Routes
app.use("/api/auth", authRoutes);           // Authentication routes
app.use("/api/visitors", visitorRoutes);    // Visitor management routes

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});