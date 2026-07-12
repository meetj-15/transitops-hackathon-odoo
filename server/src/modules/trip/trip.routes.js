import express from "express";
import * as tripController from "./trip.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import authorize from "../../middleware/role.middleware.js";
import { validateUuidParam } from "../../middleware/validateUuidParam.middleware.js";
import { validateCreateTrip, validateCompleteTrip } from "./trip.validation.js";

const tripRoutes = express.Router();

tripRoutes.use(authMiddleware);
tripRoutes.get("/", tripController.getTrips);
tripRoutes.post("/", authorize("Fleet Manager", "Driver"), validateCreateTrip, tripController.createTrip);
tripRoutes.post("/:id/dispatch", authorize("Fleet Manager", "Driver"), validateUuidParam("id", "trip ID"), tripController.dispatchTrip);
tripRoutes.post("/:id/complete", authorize("Fleet Manager", "Driver"), validateUuidParam("id", "trip ID"), validateCompleteTrip, tripController.completeTrip);
tripRoutes.post("/:id/cancel", authorize("Fleet Manager", "Driver"), validateUuidParam("id", "trip ID"), tripController.cancelTrip);

export default tripRoutes;
