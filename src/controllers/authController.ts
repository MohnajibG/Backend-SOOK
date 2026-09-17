import { Request, Response } from "express";

import uid2 from "uid2";
import bcrypt from "bcryptjs";
import SHA256 from "crypto-js/sha256"; // conservé pour vérifier les anciens comptes (pré-bcrypt)
import User from "../models/User";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { SignupRequestBody } from "../types/types";

// ==============================
// Signup
// ==============================
export const signup = async (
  req: Request<{}, {}, SignupRequestBody>,
  res: Response
): Promise<void> => {
  const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY || "",
  });
  const sentFrom = new Sender(`you@${process.env.DOMAIN}`, "SOOK");

  const { username, email, password, confirmPassword } = req.body;

  // Validation basique
  if (!username || !email || !password || !confirmPassword) {
    res.status(400).json({ message: "Tous les champs sont requis." });
    return;
  }

  if (password !== confirmPassword) {
    res
      .status(400)
      .json({ message: "Les mots de passe ne correspondent pas." });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Email invalide." });
    return;
  }

  // Validation mot de passe
  const passwordRegex = {
    length: /.{8,}/,
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /\d/,
    special: /[@$!%*?&]/,
  };
  const errors: string[] = [];
  if (!passwordRegex.length.test(password))
    errors.push("Le mot de passe doit contenir au moins 8 caractères.");
  if (!passwordRegex.uppercase.test(password))
    errors.push("Le mot de passe doit contenir au moins une majuscule.");
  if (!passwordRegex.lowercase.test(password))
    errors.push("Le mot de passe doit contenir au moins une minuscule.");
  if (!passwordRegex.number.test(password))
    errors.push("Le mot de passe doit contenir au moins un chiffre.");
  if (!passwordRegex.special.test(password))
    errors.push(
      "Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)."
    );

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "Email déjà utilisé." });
      return;
    }

    // Génération des credentials
    const hash = await bcrypt.hash(password, 12);
    const token = uid2(64);

    const newUser = new User({
      email,
      account: { username },
      hash,
      token,
    });
    await newUser.save();

    // Envoi email bienvenue
    const message = `Bonjour ${username}, bienvenue dans SOOK!`;
    const recipients = [new Recipient(email, username)];
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject("Bienvenue dans SOOK!")
      .setHtml(`<strong>${message}</strong>`)
      .setText(message);

    try {
      await mailerSend.email.send(emailParams);
    } catch (emailError) {
      console.error("Erreur envoi mail:", emailError);
      // On continue quand même l’inscription, mais on prévient le client
      res.status(201).json({
        message: "Inscription réussie (⚠️ mais email non envoyé).",
        userId: newUser._id,
        token: newUser.token,
        account: { username: newUser.account.username },
      });
      return;
    }

    res.status(201).json({
      message: "Inscription réussie. Un e-mail de bienvenue a été envoyé.",
      userId: newUser._id,
      token: newUser.token,
      account: { username: newUser.account.username },
    });
  } catch (error) {
    console.error("Erreur signup:", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// ==============================
// Login
// ==============================
export const login = async (
  req: Request<{}, {}, { email: string; password: string }>,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email et mot de passe requis." });
    return;
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Utilisateur non trouvé." });
      return;
    }

    let passwordMatches: boolean;

    if (user.salt) {
      // Compte créé avant le passage à bcrypt : on vérifie avec l'ancien
      // schéma (SHA256 + salt), puis on migre le hash de façon transparente.
      passwordMatches = SHA256(password + user.salt).toString() === user.hash;
      if (passwordMatches) {
        user.hash = await bcrypt.hash(password, 12);
        user.salt = undefined;
      }
    } else {
      passwordMatches = await bcrypt.compare(password, user.hash);
    }

    if (!passwordMatches) {
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
  } catch (error) {
    console.error("Erreur login:", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
