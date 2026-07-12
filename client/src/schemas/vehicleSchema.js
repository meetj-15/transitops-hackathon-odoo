import { z } from "zod";

export const vehicleSchema = z.object({
  registration_no: z.string().trim().min(1, "Registration number is required.").max(50).transform((value) => value.toUpperCase()),
  vehicle_name: z.string().trim().min(1, "Vehicle name is required."),
  model: z.string().trim().optional(),
  vehicle_type: z.string().trim().min(1, "Vehicle type is required."),
  max_load_capacity: z.coerce.number().positive("Capacity must be greater than 0."),
  odometer: z.coerce.number().min(0, "Odometer cannot be negative."),
  acquisition_cost: z.coerce.number().min(0, "Acquisition cost cannot be negative."),
  region: z.string().trim().min(1, "Region is required."),
});
