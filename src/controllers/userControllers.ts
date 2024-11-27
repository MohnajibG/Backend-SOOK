import { Request, Response } from "express";
import uid2 from "uid2";
import SHA256 from "crypto-js/sha256";
const cloudinary = require("cloudinary").v2;
import encBase64 from "crypto-js/enc-base64";
import fileUpload from "express-fileupload";
import User from "../models/User";
import { SignupRequestBody, UpdateProfileParams } from "../types/types";

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const signup = async (
  req: Request<{}, {}, SignupRequestBody>,
  res: Response
): Promise<Response> => {
  // Retourne un Response au lieu de void
  const { username, email, password, confirmPassword } = req.body;

  // 1. Validation des paramètres
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "Tous les champs sont requis." });
  }

  // 2. Vérification de la correspondance des mots de passe
  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ message: "Les mots de passe ne correspondent pas." });
  }

  try {
    // 3. Vérification de l'existence de l'email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email déjà utilisé." });
    }

    // 4. Hachage du mot de passe
    const salt = uid2(64); // Générer un sel unique
    const hash = SHA256(password + salt).toString(); // Hacher le mot de passe avec le sel
    const token = uid2(64);

    // 5. Création de l'utilisateur
    const newUser = new User({
      email,
      account: { username },
      password: hash,
      salt,
      token, // Génère un token unique pour l'utilisateur
    });

    await newUser.save();

    // 6. Réponse avec les données essentielles
    return res.status(201).json({
      userId: newUser._id,
      token: newUser.token,
      account: { username: newUser.account.username },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

const login = async (
  req: Request<{}, {}, SignupRequestBody>,
  res: Response
): Promise<Response> => {
  // Retourne un Response au lieu de void
  const { email, password } = req.body;

  // 1. Validation des paramètres
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email et mot de passe sont requis." });
  }

  try {
    // 2. Recherche de l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé." });
    }

    // 3. Comparaison du mot de passe
    const hashedPassword = SHA256(password + user.salt).toString(); // Hachage du mot de passe fourni avec le sel de l'utilisateur
    if (hashedPassword !== user.password) {
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }

    // 4. Génération d'un token de session pour l'utilisateur
    const token = uid2(32); // Génération d'un token unique pour la session

    // 5. Mise à jour du token de l'utilisateur dans la base de données (facultatif)
    user.token = token;
    await user.save();

    // 6. Réponse avec le token et les informations de l'utilisateur
    return res.status(200).json({
      message: "Connexion réussie.",
      token,
      userId: user._id,
      account: { username: user.account.username, avatar: user.account.avatar },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

const updateProfile = async (
  req: Request<UpdateProfileParams, {}, SignupRequestBody>,
  res: Response
): Promise<Response> => {
  // Retourne un Response au lieu de void
  const { userId } = req.params;
  const { address, phoneNumber, country } = req.body;

  // 1. Validation des paramètres
  if (!address || !phoneNumber || !country) {
    return res.status(400).json({ message: "Tous les champs sont requis." });
  }

  try {
    // 2. Recherche de l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // 3. Mise à jour des informations
    user.account.address = address;
    user.account.phoneNumber = phoneNumber;
    user.account.country = country;

    await user.save();

    // 4. Réponse avec les nouvelles informations du profil
    return res.status(200).json({
      message: "Profil mis à jour avec succès.",
      account: {
        address: user.account.address,
        phoneNumber: user.account.phoneNumber,
        country: user.account.country,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

const uploadAvatar = async (req: Request, res: Response): Promise<Response> => {
  // Retourne un Response au lieu de void
  const { userId } = req.params;

  // 1. Vérification du fichier
  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier avatar fourni." });
  }

  try {
    // 2. Upload de l'avatar sur Cloudinary
    const result = await cloudinary.v2.uploader.upload(req.file.path);

    // 3. Mise à jour du profil utilisateur avec l'URL de l'avatar
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    user.account.avatar = result.secure_url;
    await user.save();

    // 4. Réponse avec le nouvel avatar
    return res.status(200).json({
      message: "Avatar mis à jour avec succès.",
      avatar: result.secure_url,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// Export des handlers
export { signup, login, updateProfile, uploadAvatar };
