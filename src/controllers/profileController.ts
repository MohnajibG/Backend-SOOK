import { NextFunction, Request, Response } from "express";
import cloudinary from "cloudinary";
import User from "../models/User";
import { UpdateprofileUpdateParams, SignupRequestBody } from "../types/types";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Fonction pour mettre à jour le profil
export const updateProfile = async (
  req: Request<UpdateprofileUpdateParams, {}, SignupRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId } = req.params;
  const { sexe, dateOfBorn, address, phoneNumber, country } = req.body;

  if (!address || !phoneNumber || !country) {
    res.status(400).json({
      message:
        "Tous les champs (adresse, téléphone, pays,sexe, date de naissence) sont requis.",
    });
    return;
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé." });
      return;
    }

    // Mise à jour des champs du profil utilisateur
    user.account.sexe = sexe;
    user.account.dateOfBorn = dateOfBorn;
    user.account.address = address;
    user.account.phoneNumber = phoneNumber;
    user.account.country = country;
    await user.save();

    res.status(200).json({
      message: "Profil mis à jour avec succès.",
      account: {
        sexe: user.account.sexe,
        dateOfBorn: user.account.dateOfBorn,
        address: user.account.address,
        phoneNumber: user.account.phoneNumber,
        country: user.account.country,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// Fonction pour uploader un avatar
export const uploadAvatar = async (
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId } = req.params;

  if (!req.file) {
    res.status(400).json({ message: "Aucun fichier avatar fourni." });
    return;
  }

  try {
    // Upload de l'avatar sur Cloudinary
    const result = await cloudinary.v2.uploader.upload(req.file.path);

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé." });
      return;
    }

    // Mise à jour de l'URL de l'avatar dans le profil utilisateur
    user.account.avatar = result.secure_url;
    await user.save();

    res.status(200).json({
      message: "Avatar mis à jour avec succès.",
      avatar: result.secure_url,
    });
  } catch (error) {
    console.error("Erreur lors de l'upload de l'avatar :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
