import { Request, Response, NextFunction } from "express";
import User from "../models/User";

import { AuthenticatedRequest } from "../types/types";

const isAuthenticated = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Vérifiez si le header Authorization est présent
    const authorizationHeader = (req.headers as { authorization?: string })
      .authorization;
    if (!authorizationHeader) {
      res.status(401).json({ message: "Unauthorized 🤟🏻" });
      return;
    }

    // Extraire et nettoyer le token
    const token = authorizationHeader.replace("Bearer ", "");
    if (!token) {
      res.status(401).json({ message: "Unauthorized 🤟🏻" });
      return;
    }

    // Cherchez l'utilisateur correspondant au token dans la base de données
    const user = (await User.findOne({ token }).lean().exec()) as {
      _id: string;
      name?: string;
      email?: string;
    } | null; // Assurez-vous que votre modèle User a une propriété `token`.

    if (!user) {
      res.status(401).json({ message: "Unauthorized 🙀" });
      return;
    }

    // Ajouter l'utilisateur au `req` pour une utilisation ultérieure
    req.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    // Passer au middleware ou contrôleur suivant
    return next();
  } catch (error) {
    // Gérer les erreurs éventuelles
    console.error("Erreur dans isAuthenticated:", error);
    res.status(500).json({ error: (error as Error).message });
    return;
  }
};

export default isAuthenticated;
