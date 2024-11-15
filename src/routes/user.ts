import express, { Request, Response } from "express";
import uid2 from "uid2";
import SHA256 from "crypto-js/sha256";
import encBase64 from "crypto-js/enc-base64";
import User, { UserProps } from "../models/User"; // Assurez-vous que le chemin est correct

// Interface pour la requête de création d'utilisateur
interface SignupRequestBody {
  username: string;
  email: string;
  password: string;
  confirmePassword: string;
  avatar?: string; // si c'est optionnel
  newsletter?: boolean; // si c'est optionnel
}

// // Interface pour la requête de connexion
// interface LoginRequestBody {
//   email: string;
//   password: string;
// }

// Initialisation du routeur
const router = express.Router();

// Route pour la création d'un utilisateur
router.post("/user/signup", async (req: Request, res: Response) => {
  const { username, email, password, confirmePassword, avatar, newsletter } =
    req.body;
  try {
    // Validation des mots de passe
    if (password !== confirmePassword) {
      return res
        .status(400)
        .json({ message: "Les mots de passe ne sont pas identiques." });
    }

    // Validation des champs obligatoires
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Paramètres manquants." });
    }

    // Vérification de la validité de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email invalide." });
    }

    // Vérification de l'existence de l'email
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(409).json({ message: "L'email existe déjà." });
    }

    // Création des informations de sécurité
    const salt = uid2(64);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(64);

    // Création d'un nouvel utilisateur
    const newUser = new User<UserProps>({
      email: email,
      account: {
        username: username,
        avatar: avatar,
      },
      newsletter: newsletter || false, // Défaut à false si non défini
      token: token,
      hash: hash,
      salt: salt,
    });

    // Sauvegarde de l'utilisateur dans la base de données
    await newUser.save();

    // Réponse au client
    res.status(201).json({
      _id: newUser._id,
      token: newUser.token,
      account: {
        username: newUser.account.username,
      },
    });
  } catch (error: any) {
    console.error("Erreur lors de la création de l'utilisateur :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
});

// Route pour la connexion d'un utilisateur
router.post("/user/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation des champs obligatoires
    if (!email || !password) {
      return res.status(400).json({ message: "Paramètres manquants." });
    }

    // Recherche de l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Email ou mot de passe incorrect." });
    }

    // Validation du mot de passe
    const hashedPassword = SHA256(password + user.salt).toString(encBase64);
    if (hashedPassword === user.hash) {
      // Réponse en cas de succès
      res.status(200).json({
        _id: user._id,
        token: user.token,
        account: user.account,
      });
    } else {
      // Réponse en cas d'erreur de mot de passe
      return res
        .status(400)
        .json({ message: "Email ou mot de passe incorrect." });
    }
  } catch (error: any) {
    console.error("Erreur lors de la connexion de l'utilisateur :", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
});

export default router;
