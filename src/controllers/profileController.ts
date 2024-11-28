import { Request, Response } from "express";
import cloudinary from "cloudinary";
import User from "../models/User";
import { UpdateProfileParams } from "../types/types";
import { SignupRequestBody } from "../types/types";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Fonction pour mettre à jour le profil
export const updateProfile = async (
  req: Request<UpdateProfileParams, {}, SignupRequestBody>,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  const { address, phoneNumber, country } = req.body;
  if (!address || !phoneNumber || !country) {
    res.status(400).json({ message: "Tous les champs sont requis." });
    return;
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé." });
      return;
    }
    user.account.address = address;
    user.account.phoneNumber = phoneNumber;
    user.account.country = country;
    await user.save();
    res.status(200).json({
      message: "Profil mis à jour avec succès.",
      account: {
        address: user.account.address,
        phoneNumber: user.account.phoneNumber,
        country: user.account.country,
      },
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur interne du serveur." });
    return;
  }
};

// Fonction pour uploader un avatar
export const uploadAvatar = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  if (!req.file) {
    res.status(400).json({ message: "Aucun fichier avatar fourni." });
    return;
  }
  try {
    const result = await cloudinary.v2.uploader.upload(req.file.path);
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé." });
      return;
    }
    user.account.avatar = result.secure_url;
    await user.save();
    res.status(200).json({
      message: "Avatar mis à jour avec succès.",
      avatar: result.secure_url,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur interne du serveur." });
    return;
  }
};
