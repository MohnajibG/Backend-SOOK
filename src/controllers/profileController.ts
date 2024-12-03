import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import { UpdateprofileUpdateParams, SignupRequestBody } from "../types/types";

// Fonction pour mettre à jour le profil
export const updateProfile = async (
  req: Request<UpdateprofileUpdateParams, {}, SignupRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId } = req.params;
  const { sexe, dateOfBorn, address, phoneNumber, country } = req.body;

  console.log(userId);

  // Vérifie que tous les champs requis sont présents
  if (!address || !phoneNumber || !country) {
    res.status(400).json({
      message:
        "Tous les champs (adresse, téléphone, pays, sexe, date de naissance) sont requis.",
    });
    return;
  }

  try {
    // Recherche l'utilisateur par ID
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

  console.log(userId);
};

// Fonction pour récupérer les informations du profil d'un utilisateur par ID
export const getUserProfile = async (
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId } = req.params;

  try {
    // Recherche l'utilisateur par ID dans la base de données (en supposant MongoDB)
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
      return;
    }

    // Envoie la réponse avec les informations de l'utilisateur
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
