import express from "express";
import { googleLogin } from "../controllers/googleAuthController";

const router = express.Router();

// Route login Google
router.post("/google-login", googleLogin);

export default router;
