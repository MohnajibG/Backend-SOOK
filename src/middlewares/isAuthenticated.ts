import { Request, Response, NextFunction } from "express";
import User from "../models/User";

const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ message: "Unauthorized: missing token" });
      return;
    }

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      res.status(401).json({ message: "Unauthorized: invalid token" });
      return;
    }

    const user = await User.findOne({ token }).lean();
    if (!user) {
      res.status(401).json({ message: "Unauthorized: user not found" });
      return;
    }

    // Injection typée de l'utilisateur
    req.user = {
      _id: user._id.toString(),
      email: user.email,
      name: user.account?.username || undefined,
    };

    next();
  } catch (error) {
    console.error("Erreur dans isAuthenticated:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

export default isAuthenticated;
