import { z } from "zod";

export const driverSchema = z.object({
  license_no: z.string().trim().min(1, "Licence number is required."),
  license_category: z.string().trim().min(1, "Licence category is required."),
  license_expiry: z.string().min(1, "Licence expiry date is required."),
  phone: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().trim().min(10, "Phone number must be at least 10 digits.").optional()
  ),
  safety_score: z.coerce.number().min(0).max(100).optional(),
  user_id: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().uuid("User ID must be a valid UUID.").optional()
  ),
});
