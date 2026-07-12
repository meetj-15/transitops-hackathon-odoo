import { z } from "zod";

const createTripSchema = z.object({
  vehicle_id: z.string().uuid("Invalid vehicle ID"),
  driver_id: z.string().uuid("Invalid driver ID"),
  source: z.string().min(2, "Source is required"),
  destination: z.string().min(2, "Destination is required"),
  cargo_weight: z.number().positive("Cargo weight must be greater than 0"),
  planned_distance: z.number().positive("Planned distance must be greater than 0"),
  revenue: z.number().nonnegative().default(0)
});

const completeTripSchema = z.object({
  actual_distance: z.number().positive("Actual distance required"),
  end_odometer: z.number().positive("End odometer required")
});

export const validateCreateTrip = (req, res, next) => {
  try {
    req.body = createTripSchema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: err.errors[0]?.message } });
  }
};

export const validateCompleteTrip = (req, res, next) => {
  try {
    req.body = completeTripSchema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: err.errors[0]?.message } });
  }
};