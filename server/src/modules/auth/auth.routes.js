import express from "express";
import * as authController from "./auth.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import {
  validateRegister,
  validateLogin,
} from "./auth.validation.js";

const router = express.Router();

router.post("/register",validateRegister, authController.register);

router.post("/login",validateLogin, authController.login);

router.get("/me", authMiddleware, authController.getMe);

export default router;