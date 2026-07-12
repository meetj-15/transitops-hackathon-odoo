import { z } from "zod";

export const tripSchema = z.object({
  vehicle_id: z.string().min(1, "Vehicle is required."),
  driver_id: z.string().min(1, "Driver is required."),
  source: z.string().trim().min(1, "Source is required."),
  destination: z.string().trim().min(1, "Destination is required."),
  cargo_weight: z.coerce.number().positive("Cargo weight must be greater than 0."),
  planned_distance: z.coerce.number().positive("Planned distance must be greater than 0."),
  revenue: z.coerce.number().min(0, "Revenue cannot be negative.").default(0),
});

export const tripCompletionSchema = z.object({
  actual_distance: z.coerce.number().positive("Actual distance is required."),
  end_odometer: z.coerce.number().positive("End odometer is required."),
});
