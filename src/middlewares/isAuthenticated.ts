import { Request, Response, NextFunction } from "express";
import User from "../models/User";

const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Vérifiez si le header Authorization est présent
    const authorizationHeader = (req.headers as { authorization?: string })
      .authorization;
    if (!authorizationHeader) {
      console.warn("⚠️ Aucun header Authorization reçu");
      res.status(401).json({ message: "Unauthorized 🤟🏻" });
      return;
    }

    // Extraire et nettoyer le token
    const token = authorizationHeader.replace("Bearer ", "").trim();
    if (!token) {
      console.warn("⚠️ Token vide ou invalide");
      res.status(401).json({ message: "Unauthorized 🤟🏻" });
      return;
    }

    console.log("🔑 Token reçu :", token);

    // Cherchez l'utilisateur correspondant au token dans la base de données
    const user = (await User.findOne({ token }).lean().exec()) as {
      _id: any;
      name?: string;
      email?: string;
      account?: { username?: string };
    } | null;

    if (!user) {
      console.warn("❌ Aucun utilisateur trouvé avec ce token");
      res.status(401).json({ message: "Unauthorized 🙀" });
      return;
    }

    console.log("✅ Utilisateur trouvé :", {
      _id: user._id,
      email: user.email,
      username: user.account?.username,
    });

    // Ajouter l'utilisateur au `req` pour une utilisation ultérieure
    req.user = {
      _id: user._id.toString(), // 🔎 converti en string
      name: user.account?.username || user.name,
      email: user.email,
    };

    console.log("📌 req.user injecté :", req.user);

    // Passer au middleware ou contrôleur suivant
    return next();
  } catch (error) {
    console.error("🔥 Erreur dans isAuthenticated:", error);
    res.status(500).json({ error: (error as Error).message });
    return;
  }
};

export default isAuthenticated;
