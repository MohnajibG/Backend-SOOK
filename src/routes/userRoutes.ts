import express, { Request, Response, Router } from "express";
import { signup, login } from "../controllers/authController";
import { updateProfile, uploadAvatar } from "../controllers/profileController";

const router = express.Router();

// Déclare tes routes
router.post("/signup", signup);
router.post("/login", login);
router.put("/profile/:userId", updateProfile);
router.post("/profile/:userId/avatar", uploadAvatar);

export default router;
