import express from "express";
import dotenv from "dotenv";
import pool from "./config/db.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
// Test database connection
app.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({
            success: true,
            message: "Server & Database Connected",
            time: result.rows[0].now,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Database connection failed",
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});