import express from "express";
import * as authController from "./auth.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import {
  validateRegister,
  validateLogin,
} from "./auth.validation.js";

const authRoutes = express.Router();

authRoutes.post("/register",validateRegister, authController.register);

authRoutes.post("/login",validateLogin, authController.login);

authRoutes.get("/me", authMiddleware, authController.getMe);

export default authRoutes;