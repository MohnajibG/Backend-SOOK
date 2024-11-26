import express, { Request, Response, Router } from "express";
import uid2 from "uid2";
import SHA256 from "crypto-js/sha256";
import encBase64 from "crypto-js/enc-base64";
import fileUpload from "express-fileupload";
import cloudinary from "cloudinary";
import isAuthenticated from "../middlewares/isAuthenticated";
import updateUserData from "./updateUserData";

import User, { UserProps } from "../models/User";

const router: Router = express.Router();

export interface SignupRequestBody {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  avatar?: string;
  newsletter?: boolean;
  address: string;
  phoneNumber: string;
  country: string;
}

const validateUserParams = (
  email: string,
  password: string,
  confirmPassword: string
) => {
  if (!email || !password) return "Email et mot de passe sont requis.";
  if (password !== confirmPassword)
    return "Les mots de passe ne correspondent pas.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Email invalide.";
  return null;
};

const handleAvatarUpload = async (avatar: fileUpload.UploadedFile) => {
  if (!avatar) return undefined;
  const base64String = avatar.data.toString("base64");
  const uploadResponse = await cloudinary.v2.uploader.upload(
    `data:image/jpeg;base64,${base64String}`
  );
  return uploadResponse.secure_url;
};

const signupHandler = async (
  req: Request<{}, {}, SignupRequestBody>,
  res: Response
): Promise<void> => {
  // Retourne void, pas un Response
  const { username, email, password, confirmPassword, address, phoneNumber } =
    req.body;

  try {
    const validationError = validateUserParams(
      email,
      password,
      confirmPassword
    );
    if (validationError) {
      res.status(400).json({ message: validationError });
      return; // Ajout d'un return pour éviter de continuer après l'envoi de la réponse
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "Email déjà utilisé." });
      return;
    }

    const salt = uid2(64);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(64);

    const avatarUrl = req.files?.avatar
      ? await handleAvatarUpload(req.files.avatar as fileUpload.UploadedFile)
      : undefined;

    const newUser = new User({
      email,
      account: { username, avatar: avatarUrl },
      newsletter: req.body.newsletter || false,
      token,
      hash,
      salt,
      address,
      phoneNumber,
    });

    await newUser.save();
    res.status(201).json({
      _id: newUser._id,
      token: newUser.token,
      account: { username: newUser.account.username },
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

const loginHandler = async (
  req: Request<{}, {}, SignupRequestBody>,
  res: Response
): Promise<void> => {
  // Retourne void, pas un Response
  const { email, password } = req.body;

  try {
    const validationError = validateUserParams(email, password, password);
    if (validationError) {
      res.status(400).json({ message: validationError });
      return; // Ajout d'un return pour éviter de continuer après l'envoi de la réponse
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Email incorrect." });
      return;
    }

    const hashedPassword = SHA256(password + user.salt).toString(encBase64);
    if (hashedPassword !== user.hash) {
      res.status(400).json({ message: "Mot de passe incorrect." });
      return;
    }

    res.status(200).json({
      _id: user._id,
      username: user.account.username,
      token: user.token,
    });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

const updateProfileHandler = async (
  req: Request<{ userId: string }, {}, Partial<UserProps["account"]>>,
  res: Response
): Promise<void> => {
  try {
    const user = await updateUserData(
      req.params.userId,
      req.body,
      req.files?.avatar as fileUpload.UploadedFile
    );

    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé." });
      return;
    }

    res.status(200).json({
      message: "Profil mis à jour avec succès.",
      user: {
        _id: user._id,
        ...user.account,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

const uploadAvatarHandler = async (
  req: Request<{ userId: string }, {}, {}>,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId || !req.files?.avatar) {
      res
        .status(400)
        .json({ message: "ID utilisateur ou fichier d'avatar manquant." });
      return;
    }

    const user = await updateUserData(
      userId,
      {},
      req.files.avatar as fileUpload.UploadedFile
    );

    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé." });
      return;
    }

    res.status(200).json({
      message: "Avatar mis à jour avec succès.",
      avatarUrl: user.account.avatar,
    });
  } catch (error) {
    console.error("Erreur lors du téléchargement de l'avatar :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

router.post("/user/upload-avatar", fileUpload(), uploadAvatarHandler);
router.put("/user/profile/:userId", isAuthenticated, updateProfileHandler);

router.post("/user/signup", signupHandler);
router.post("/user/login", loginHandler);

export default router;
