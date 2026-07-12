import express from "express";
import * as fuelController from "./fuel.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import authorize from "../../middleware/role.middleware.js";

const router = express.Router();
router.use(authMiddleware);
router.get("/", fuelController.getFuelLogs);
router.post("/", authorize("Admin", "Fleet Manager", "Driver"), fuelController.createFuelLog);
export default router;