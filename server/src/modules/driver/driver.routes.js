import express from "express";
import * as driverController from "./driver.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import authorize from "../../middleware/role.middleware.js";
import { validateDriver } from "./driver.validation.js";

const driverRoutes = express.Router();

driverRoutes.use(authMiddleware);
driverRoutes.get("/", driverController.getDrivers);
driverRoutes.get("/available", driverController.getAvailableDrivers);
driverRoutes.post("/", authorize("Fleet Manager", "Safety Officer"), validateDriver, driverController.createDriver);

export default driverRoutes;