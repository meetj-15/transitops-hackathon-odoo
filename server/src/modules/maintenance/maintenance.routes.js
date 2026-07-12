import express from "express";
import * as maintenanceController from "./maintenance.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import authorize from "../../middleware/role.middleware.js";
import { validateMaintenance } from "./maintenance.validation.js";

const maintenanceRoutes = express.Router();

maintenanceRoutes.use(authMiddleware);
maintenanceRoutes.get("/", maintenanceController.getLogs);
maintenanceRoutes.post("/", authorize("Fleet Manager", "Safety Officer"), validateMaintenance, maintenanceController.createLog);
maintenanceRoutes.put("/:id/close", authorize( "Fleet Manager", "Safety Officer"), maintenanceController.closeLog);

export default maintenanceRoutes;