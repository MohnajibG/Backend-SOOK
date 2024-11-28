import express from "express";
import { signup, login } from "../controllers/authController";
import {
  updateprofileUpdate,
  uploadAvatar,
} from "../controllers/profileController";
import isAuthenticated from "../middlewares/isAuthenticated";
const router = express.Router();

// Déclare tes routes
router.post("/signup", signup);
router.post("/login", login);
router.put("/profileUpdate/:userId", updateprofileUpdate);
router.post("/profileUpdate/:userId/avatar", isAuthenticated, uploadAvatar);

export default router;
