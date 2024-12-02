import express from "express";
import { signup, login } from "../controllers/authController";
import { updateProfile, uploadAvatar } from "../controllers/profileController";
import isAuthenticated from "../middlewares/isAuthenticated";
const router = express.Router();

// Déclare tes routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/updateProfile/:id", updateProfile);

router.put("/profilePage:id/", updateProfile);
router.post("/profileUpdate/avatar/:id", isAuthenticated, uploadAvatar);
router.post("/profileUpdate/avatar/:id", isAuthenticated, uploadAvatar);

export default router;
