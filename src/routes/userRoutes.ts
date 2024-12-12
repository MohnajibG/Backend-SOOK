import express from "express";
import { signup, login } from "../controllers/authController";
import {
  getUserProfile,
  updateProfile,
  // uploadAvatar,
} from "../controllers/profileController";
const router = express.Router();

// Déclare tes routes
router.post("/signup", signup);
router.post("/login", login);

export default router;
