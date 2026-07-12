import express from "express";
import * as dashboardController from "./dashboard.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";

const dashboardRoutes = express.Router();
dashboardRoutes.use(authMiddleware);
dashboardRoutes.get("/", dashboardController.getDashboardStats);
export default dashboardRoutes;