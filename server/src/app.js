import express from "express";
import cors from "cors";

// Import all module routes
import authRoutes from "./modules/auth/auth.routes.js";
import vehicleRoutes from "./modules/vehicle/vehicle.routes.js";
import driverRoutes from "./modules/driver/driver.routes.js";
import tripRoutes from "./modules/trip/trip.routes.js";
import maintenanceRoutes from "./modules/maintenance/maintenance.routes.js";
import fuelRoutes from "./modules/fuel/fuel.routes.js";
import expenseRoutes from "./modules/expense/expense.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 TransitOps Backend API is live and running!",
    timestamp: new Date().toISOString()
  });
});

// Mount API Routes
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/fuel-logs", fuelRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: err.message || "An unexpected error occurred"
    }
  });
});

export default app;