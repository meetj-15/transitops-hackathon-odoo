import { z } from "zod";

const maintenanceSchema = z.object({
  vehicle_id: z.string().uuid("Invalid vehicle ID"),
  maintenance_type: z.string().min(2, "Maintenance type is required"),
  description: z.string().optional(),
  cost: z.number().nonnegative("Cost must be 0 or greater").default(0),
  start_date: z.string().optional()
});

export const validateMaintenance = (req, res, next) => {
  try {
    req.body = maintenanceSchema.parse(req.body);
    next();
  } catch (err) {
    const message = err.issues?.[0]?.message || err.errors?.[0]?.message || "Invalid maintenance data";
    return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message } });
  }
};
