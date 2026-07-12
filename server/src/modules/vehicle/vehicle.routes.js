import express from "express";
import * as vehicleController from "./vehicle.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import authorize from "../../middleware/role.middleware.js";
import { validateUuidParam } from "../../middleware/validateUuidParam.middleware.js";
import {
  validateCreateVehicle,
  validateUpdateVehicle,
} from "./vehicle.validation.js";

const vehicleRoutes = express.Router();


vehicleRoutes.post(
  "/",
  authMiddleware,
  authorize("Fleet Manager"),
  validateCreateVehicle,
  vehicleController.createVehicle
);

vehicleRoutes.get(
  "/",
  authMiddleware,
  vehicleController.getAllVehicles
);

vehicleRoutes.get(
  "/:id",
  authMiddleware,
  validateUuidParam("id", "vehicle ID"),
  vehicleController.getVehicleById
);

vehicleRoutes.put(
  "/:id",
  authMiddleware,
  authorize("Fleet Manager"),
  validateUuidParam("id", "vehicle ID"),
  validateUpdateVehicle,
  vehicleController.updateVehicle
);

vehicleRoutes.delete(
  "/:id",
  authMiddleware,
  authorize("Fleet Manager"),
  validateUuidParam("id", "vehicle ID"),
  vehicleController.deleteVehicle
);

export default vehicleRoutes;
