import express from "express";
import * as vehicleController from "./vehicle.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import authorize from "../../middleware/role.middleware.js";
import {
  validateCreateVehicle,
  validateUpdateVehicle,
} from "./vehicle.validation.js";

const router2 = express.Router();


router2.post(
  "/",
  authMiddleware,
  authorize("Fleet Manager"),
  validateCreateVehicle,
  vehicleController.createVehicle
);

router2.get(
  "/",
  authMiddleware,
  vehicleController.getAllVehicles
);

router2.get(
  "/:id",
  authMiddleware,
  vehicleController.getVehicleById
);

router2.put(
  "/:id",
  authMiddleware,
  authorize("Fleet Manager"),
  validateUpdateVehicle,
  vehicleController.updateVehicle
);

router2.delete(
  "/:id",
  authMiddleware,
  authorize("Fleet Manager"),
  vehicleController.deleteVehicle
);

export default router2;