import { NextFunction, Request, Response } from "express";
import User from "../models/User";

// Mise à jour du profil utilisateur
export const updateProfile = async (
  req: Request<
    { userId: string }, // Typage des paramètres de requête
    {},
    {
      userId: string;
      prodeuctId: any;
      quantity: any;
      username?: string; // Typage du corps de la requête
      sexe: string;
      dateOfBorn: string;
      address: string;
      phoneNumber: string;
      country: string;
      postalCode: string;
      avatar: string;
    }
  >,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId } = req.params;
  const {
    sexe,
    dateOfBorn,
    address,
    postalCode,
    phoneNumber,
    country,
    avatar,
  } = req.body;

  // Validation des champs obligatoires
  if (!address || !phoneNumber || !country || !sexe || !dateOfBorn) {
    res.status(400).json({
      message:
        "Tous les champs (adresse, téléphone, pays, sexe, date de naissance) sont requis.",
    });
    return;
  }

  try {
    // Mise à jour des informations utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "account.sexe": sexe,
          "account.dateOfBorn": dateOfBorn,
          "account.address": address,
          "account.postalCode": postalCode,
          "account.phoneNumber": phoneNumber,
          "account.country": country,
          "account.avatar": avatar,
        },
      },
      {
        new: true, // Retourner le document mis à jour
        runValidators: true, // Appliquer les validateurs définis dans le modèle
      }
    );

    // Vérifier si l'utilisateur existe
    if (!updatedUser) {
      res.status(404).json({ message: "Utilisateur non trouvé." });
      return;
    }

    // Réponse avec les données mises à jour
    res.status(200).json({
      message: "Profil mis à jour avec succès.",
      account: {
        username: updatedUser.account.username,
        sexe: updatedUser.account.sexe,
        dateOfBorn: updatedUser.account.dateOfBorn,
        address: updatedUser.account.address,
        postalCode: updatedUser.account.postalCode,
        phoneNumber: updatedUser.account.phoneNumber,
        country: updatedUser.account.country,
        avatar: updatedUser.account.avatar,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// Récupération du profil utilisateur
export const getUserProfile = async (
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId } = req.params;

  try {
    // Recherche de l'utilisateur par ID
    const user = await User.findById(userId);

    // Vérifier si l'utilisateur existe
    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
      return;
    }

    // Réponse avec les données utilisateur
    res.status(200).json(user);
  } catch (error) {
    console.error("Erreur lors de la récupération du profil :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
