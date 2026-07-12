import express from "express";
import * as maintenanceController from "./maintenance.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import authorize from "../../middleware/role.middleware.js";
import { validateMaintenance } from "./maintenance.validation.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/", maintenanceController.getLogs);
router.post("/", authorize("Admin", "Fleet Manager", "Safety Officer"), validateMaintenance, maintenanceController.createLog);
router.put("/:id/close", authorize("Admin", "Fleet Manager", "Safety Officer"), maintenanceController.closeLog);

export default router;