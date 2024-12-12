import express from "express";
import {
  getUserProfile,
  updateProfile,
  // uploadAvatar,
} from "../controllers/profileController";
import isAuthenticated from "../middlewares/isAuthenticated";
const router = express.Router();

// Déclare tes routes
router.get("/profile/:userId", isAuthenticated, getUserProfile);
router.put("/profile/:userId", isAuthenticated, updateProfile);

export default router;
