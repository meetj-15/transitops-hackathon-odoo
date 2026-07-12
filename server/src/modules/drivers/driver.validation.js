import { z } from "zod";

const driverSchema = z.object({
  license_no: z.string().min(3, "License number is required"),
  license_category: z.string().min(2, "License category is required"),
  license_expiry: z.string().refine((val) => !isNaN(Date.parse(val)), "Must be a valid date YYYY-MM-DD"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  safety_score: z.number().min(0).max(100).optional().default(100),
  user_id: z.string().uuid().optional().nullable()
});

export const validateDriver = (req, res, next) => {
  try {
    req.body = driverSchema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: err.errors[0]?.message || "Invalid driver data" }
    });
  }
};