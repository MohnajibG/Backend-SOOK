import { Request, Response } from "express";
import uid2 from "uid2";
import SHA256 from "crypto-js/sha256";
import User from "../models/User";
import { SignupRequestBody } from "../types/types";

// Fonction pour s'inscrire
export const signup = async (
  req: Request<{}, {}, SignupRequestBody>,
  res: Response
): Promise<void> => {
  const { username, email, password, confirmPassword } = req.body;
  //   if (!username || !email || !password || !confirmPassword) {
  //     res.status(400).json({ message: "Tous les champs sont requis." });
  //     return;
  //   }
  if (password !== confirmPassword) {
    res
      .status(400)
      .json({ message: "Les mots de passe ne correspondent pas." });
    return;
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "Email déjà utilisé." });
      return;
    }
    const salt = uid2(64);
    const hash = SHA256(password + salt).toString();
    const token = uid2(64);

    const newUser = new User({
      email,
      account: { username },
      password: hash,
      salt,
      token,
    });
    await newUser.save();
    res.status(201).json({
      userId: newUser._id,
      token: newUser.token,
      account: { username: newUser.account.username },
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur interne du serveur." });
    return;
  }
};

// Fonction pour se connecter
export const login = async (
  req: Request<{}, {}, SignupRequestBody>,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "Email et mot de passe sont requis." });
    return;
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Utilisateur non trouvé." });
      return;
    }
    const hashedPassword = SHA256(password + user.salt).toString();
    if (hashedPassword !== user.password) {
      res.status(401).json({ message: "Mot de passe incorrect." });
      return;
    }
    const token = uid2(32);
    user.token = token;
    await user.save();
    res.status(200).json({
      message: "Connexion réussie.",
      token,
      userId: user._id,
      account: { username: user.account.username, avatar: user.account.avatar },
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur interne du serveur." });
    return;
  }
};
