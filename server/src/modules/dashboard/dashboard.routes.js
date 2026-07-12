import express from "express";
import * as dashboardController from "./dashboard.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";

const router = express.Router();
router.use(authMiddleware);
router.get("/", dashboardController.getDashboardStats);
export default router;