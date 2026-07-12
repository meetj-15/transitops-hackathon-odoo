import express from "express";
import * as driverController from "./driver.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import authorize from "../../middleware/role.middleware.js";
import { validateDriver } from "./driver.validation.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/", driverController.getDrivers);
router.get("/available", driverController.getAvailableDrivers);
router.post("/", authorize("Admin", "Fleet Manager", "Safety Officer"), validateDriver, driverController.createDriver);

export default router;