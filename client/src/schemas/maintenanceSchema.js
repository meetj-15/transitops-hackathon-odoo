import { z } from "zod";

export const maintenanceSchema = z.object({
  vehicle_id: z.string().min(1, "Vehicle is required."),
  maintenance_type: z.string().trim().min(1, "Maintenance type is required."),
  description: z.string().trim().optional(),
  cost: z.coerce.number().min(0, "Cost cannot be negative."),
  start_date: z.string().optional(),
});
