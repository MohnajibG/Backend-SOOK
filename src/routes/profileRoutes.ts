import express from "express";
import {
  getUserProfile,
  updateProfile,
  // uploadAvatar,
} from "../controllers/profileController";
import isAuthenticated from "../middlewares/isAuthenticated";
const router = express.Router();

// Déclare tes routes
router.get("/user/profile/:userId", isAuthenticated, getUserProfile);
router.put("/user/profile/:userId", isAuthenticated, updateProfile);

export default router;
