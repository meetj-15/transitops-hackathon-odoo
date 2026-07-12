import express from "express";
import * as expenseController from "./expense.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import authorize from "../../middleware/role.middleware.js";

const router = express.Router();
router.use(authMiddleware);
router.get("/", authorize("Admin", "Fleet Manager", "Financial Analyst"), expenseController.getExpenses);
router.post("/", authorize("Admin", "Fleet Manager", "Financial Analyst"), expenseController.createExpense);
export default router;