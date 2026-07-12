import { z } from "zod";

export const expenseSchema = z.object({
  category: z.enum(["Tolls", "Parking", "Maintenance", "Fuel", "Insurance", "Other"], {
    message: "Select a valid expense type.",
  }),
  vehicle_id: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().optional()
  ),
  trip_id: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().optional()
  ),
  amount: z.coerce.number().positive("Amount must be greater than 0."),
  description: z.string().trim().optional(),
  expense_date: z.string().min(1, "Expense date is required."),
});
