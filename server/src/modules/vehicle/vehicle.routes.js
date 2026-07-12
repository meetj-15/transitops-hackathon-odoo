import express from "express";
import * as vehicleController from "./vehicle.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import authorize from "../../middleware/role.middleware.js";
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
  vehicleController.getVehicleById
);

vehicleRoutes.put(
  "/:id",
  authMiddleware,
  authorize("Fleet Manager"),
  validateUpdateVehicle,
  vehicleController.updateVehicle
);

vehicleRoutes.delete(
  "/:id",
  authMiddleware,
  authorize("Fleet Manager"),
  vehicleController.deleteVehicle
);

export default vehicleRoutes;