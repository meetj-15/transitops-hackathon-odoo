import express from "express";
import * as expenseController from "./expense.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import authorize from "../../middleware/role.middleware.js";

const expenseRoutes = express.Router();
expenseRoutes.use(authMiddleware);
expenseRoutes.get("/", authorize( "Fleet Manager", "Financial Analyst"), expenseController.getExpenses);
expenseRoutes.post("/", authorize( "Fleet Manager", "Financial Analyst"), expenseController.createExpense);
export default expenseRoutes;