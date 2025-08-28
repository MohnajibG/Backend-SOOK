import { Request, Response, NextFunction } from "express";
import User from "../models/User";

const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ message: "Unauthorized: missing or invalid token" });
      return;
    }

    const token = authHeader.split(" ")[1].trim();
    if (!token) {
      res.status(401).json({ message: "Unauthorized: empty token" });
      return;
    }

    const user = await User.findOne({ token }).lean().exec();
    if (!user) {
      res.status(401).json({ message: "Unauthorized: user not found" });
      return;
    }

    // Injection correcte avec account.username
    req.user = {
      _id: user._id.toString(),
      email: user.email,
      name: user.account?.username, // ✅ corrigé
    };

    return next();
  } catch (error) {
    console.error("❌ Erreur dans isAuthenticated:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default isAuthenticated;
