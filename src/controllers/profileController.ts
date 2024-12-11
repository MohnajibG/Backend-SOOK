import { NextFunction, Request, Response } from "express";
import User from "../models/User";

export const updateProfile = async (
  req: Request<
    { userId: string },
    {},
    {
      sexe: string;
      dateOfBorn: string;
      address: string;
      phoneNumber: string;
      country: string;
    }
  >,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId } = req.params;
  const { sexe, dateOfBorn, address, phoneNumber, country } = req.body;

  // if (!address || !phoneNumber || !country || !sexe || !dateOfBorn) {
  //   res.status(400).json({
  //     message:
  //       "Tous les champs (adresse, téléphone, pays, sexe, date de naissance) sont requis.",
  //   });
  //   return;
  // }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "account.sexe": sexe,
          "account.dateOfBorn": dateOfBorn,
          "account.address": address,
          "account.phoneNumber": phoneNumber,
          "account.country": country,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "Utilisateur non trouvé." });
      return;
    }

    res.status(200).json({
      message: "Profil mis à jour avec succès.",
      account: {
        sexe: updatedUser.account.sexe,
        dateOfBorn: updatedUser.account.dateOfBorn,
        address: updatedUser.account.address,
        phoneNumber: updatedUser.account.phoneNumber,
        country: updatedUser.account.country,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

export const getUserProfile = async (
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

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
