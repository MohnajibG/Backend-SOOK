import { NextFunction, Request, Response } from "express";
import User from "../models/User";

// ==============================
// Mise à jour du profil utilisateur
// ==============================
export const updateProfile = async (
  req: Request<
    { userId: string },
    {},
    {
      username?: string;
      sexe?: string;
      dateOfBorn?: string;
      address?: string;
      phoneNumber?: string;
      country?: string;
      postalCode?: string;
      avatar?: string;
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

  // Validation minimale
  if (!address || !phoneNumber || !country || !sexe || !dateOfBorn) {
    res.status(400).json({
      message:
        "Tous les champs (adresse, téléphone, pays, sexe, date de naissance) sont requis.",
    });
    return;
  }

  try {
    // Vérification de l’utilisateur connecté
    // (⚠️ nécessite que tu injectes req.user depuis ton middleware d’auth)
    if (!req.user || (req.user as any)._id.toString() !== userId) {
      res.status(403).json({ message: "Accès interdit." });
      return;
    }

    // Mise à jour
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
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "Utilisateur non trouvé." });
      return;
    }

    res.status(200).json({
      message: "Profil mis à jour avec succès.",
      userId: updatedUser._id,
      email: updatedUser.email,
      account: updatedUser.account,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// ==============================
// Récupération du profil utilisateur
// ==============================
export const getUserProfile = async (
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId } = req.params;

  try {
    if (!req.user || (req.user as any)._id.toString() !== userId) {
      res.status(403).json({ message: "Accès interdit." });
      return;
    }

    const user = await User.findById(userId).select("-hash -salt -token");
    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Erreur lors de la récupération du profil :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
