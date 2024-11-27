import express from "express";
import multer from "multer"; // Pour gérer les fichiers

import {
  signup,
  updateProfile,
  uploadAvatar,
  login,
} from "../controllers/userControllers";
const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/user/signup", signup); // Route d'inscription
router.post("/user/login", login); // Route de connexion

router.put("/user/profile/:userId"); // Route pour mettre à jour le profil
router.put("user/avatar/:userId", upload.single("avatar")); // Route pour uploader l'avatar

export default router;
