import { z } from "zod";

export const fuelSchema = z.object({
  vehicle_id: z.string().min(1, "Vehicle is required."),
  trip_id: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().optional()
  ),
  liters: z.coerce.number().positive("Liters must be greater than 0."),
  cost: z.coerce.number().min(0, "Cost cannot be negative."),
  fuel_date: z.string().min(1, "Date is required."),
});
