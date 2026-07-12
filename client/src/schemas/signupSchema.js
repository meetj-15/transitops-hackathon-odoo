import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["Fleet Manager", "Driver", "Safety Officer", "Financial Analyst"], {
    message: "Select a workspace role.",
  }),
});
