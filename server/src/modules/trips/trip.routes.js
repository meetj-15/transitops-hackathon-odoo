import express from "express";
import * as tripController from "./trip.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import authorize from "../../middleware/role.middleware.js";
import { validateCreateTrip, validateCompleteTrip } from "./trip.validation.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/", tripController.getTrips);
router.post("/", authorize("Admin", "Fleet Manager", "Driver"), validateCreateTrip, tripController.createTrip);
router.post("/:id/dispatch", authorize("Admin", "Fleet Manager", "Driver"), tripController.dispatchTrip);
router.post("/:id/complete", authorize("Admin", "Fleet Manager", "Driver"), validateCompleteTrip, tripController.completeTrip);
router.post("/:id/cancel", authorize("Admin", "Fleet Manager", "Driver"), tripController.cancelTrip);

export default router;