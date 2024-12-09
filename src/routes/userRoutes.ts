import express from "express";
import { signup, login } from "../controllers/authController";
import {
  getUserProfile,
  updateProfile,
  // uploadAvatar,
} from "../controllers/profileController";
import isAuthenticated from "../middlewares/isAuthenticated";
const router = express.Router();

// Déclare tes routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/profile/:userId", isAuthenticated, getUserProfile);
router.put("/profile/:userId", isAuthenticated, updateProfile);

// router.post("/profileUpdate/avatar/:id", isAuthenticated, uploadAvatar);

export default router;
