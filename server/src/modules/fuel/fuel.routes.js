import express from "express";
import * as fuelController from "./fuel.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import authorize from "../../middleware/role.middleware.js";

const fuelRoutes = express.Router();
fuelRoutes.use(authMiddleware);
fuelRoutes.get("/", fuelController.getFuelLogs);
fuelRoutes.post("/", authorize("Admin", "Fleet Manager", "Driver"), fuelController.createFuelLog);
export default fuelRoutes;