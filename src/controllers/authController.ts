import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";

import uid2 from "uid2";
import SHA256 from "crypto-js/sha256";
import User from "../models/User";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { SignupRequestBody } from "../types/types";

export const signup = async (
  req: Request<{}, {}, SignupRequestBody>,
  res: Response
): Promise<void> => {
  const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY || "",
  });
  const sentFrom = new Sender(`you@${process.env.DOMAIN}`, "SOOK");

  const { username, email, password, confirmPassword } = req.body;

  // Validation des champs
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

  const passwordRegex = {
    length: /.{8,}/,
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /\d/,
    special: /[@$!%*?&]/,
  };
  let errors: string[] = [];

  if (!passwordRegex.length.test(password)) {
    errors.push("Le mot de passe doit contenir au moins 8 caractères.");
  }
  if (!passwordRegex.uppercase.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une majuscule.");
  }
  if (!passwordRegex.lowercase.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une minuscule.");
  }
  if (!passwordRegex.number.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un chiffre.");
  }
  if (!passwordRegex.special.test(password)) {
    errors.push(
      "Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)."
    );
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "Email déjà utilisé." });
    }

    // Génération des credentials
    const salt = uid2(64);
    const hash = SHA256(password + salt).toString(); // Calcul du hash
    const token = uid2(64);

    // Création de l'utilisateur
    const newUser = new User({
      email,
      account: { username },
      hash, // Utilisez uniquement `hash` ici
      salt,
      token,
    });
    await newUser.save();

    // Préparation et envoi de l'e-mail de bienvenue
    const message = `Bonjour ${username}, bienvenue dans SOOK!`;
    const recipients = [new Recipient(email, username)];
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject("Bienvenue dans SOOK!")
      .setHtml(`<strong>${message}</strong>`)
      .setText(message);

    try {
      const emailResult = await mailerSend.email.send(emailParams);
      console.log("Email envoyé avec succès :", emailResult);
    } catch (emailError) {
      console.log("Erreur d'envoi d'e-mail:", emailError);
      res.status(500).json({
        message: "Erreur interne du serveur lors de l'envoi de l'e-mail.",
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
    console.log(error);
    res.status(500).json({ message: "Erreur interne du serveur." });
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

    // Vérification du mot de passe
    const hashedPassword = SHA256(password + user.salt).toString();
    if (hashedPassword !== user.hash) {
      // Utilisation de `hash` pour comparaison
      res.status(401).json({ message: "Mot de passe incorrect." });
      return;
    }

    // Génération d'un nouveau token
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
    console.error(error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

const client = new OAuth2Client("sook-443123.apps.googleusercontent.com");

async function verifyToken(req: Request, res: Response) {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "sook-443123.apps.googleusercontent.com", // Spécifie ton client ID ici
    });
    const payload = ticket.getPayload();
    // Si l'utilisateur est authentifié, tu peux le traiter ici
    res.json({ user: payload });
  } catch (error) {
    res.status(401).send("Invalid token");
  }
}

export { verifyToken };
