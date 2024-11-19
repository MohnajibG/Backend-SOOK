import express, { Request, Response, Router } from "express";
import uid2 from "uid2";
import SHA256 from "crypto-js/sha256";
import encBase64 from "crypto-js/enc-base64";
import fileUpload from "express-fileupload";
import cloudinary from "cloudinary";
import User, { UserProps } from "../models/User";

// Configuration de Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Fonction utilitaire pour convertir un fichier en Base64
const convertToBase64 = (file: fileUpload.UploadedFile): string => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

// Routeur pour gérer les routes de l'API utilisateur
const router: Router = express.Router();
interface SignupRequestBody {
  username: string; // Le nom d'utilisateur
  email: string; // L'email de l'utilisateur
  password: string; // Le mot de passe de l'utilisateur
  confirmePassword: string; // La confirmation du mot de passe
  avatar?: string; // L'avatar de l'utilisateur (facultatif)
  newsletter?: boolean; // Abonnement à la newsletter (facultatif)
  address: string;
  phoneNumber: string;
}
interface UserSignupResponse {
  _id: string; // L'identifiant de l'utilisateur créé.
  token: string; // Le token d'authentification généré pour l'utilisateur.
  account: {
    username: string; // Le nom d'utilisateur de l'utilisateur.
  };
}

// Gestionnaire de création de compte utilisateur
const signupHandler = async (
  req: Request<{}, {}, SignupRequestBody>,
  res: Response<UserSignupResponse | { message: string }>
): Promise<void> => {
  // La fonction retourne 'void' (pas besoin de renvoyer une valeur)
  const { username, email, password, confirmePassword, address, phoneNumber } =
    req.body;

  try {
    // Validation des données d'inscription
    if (password !== confirmePassword) {
      res
        .status(400)
        .json({ message: "Les mots de passe ne sont pas identiques." });
      return; // On quitte la fonction sans retourner un objet, juste en envoyant la réponse
    }

    if (!username || !email || !password) {
      res.status(400).json({ message: "Paramètres manquants." });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: "Email invalide." });
      return;
    }

    // Vérification de l'existence de l'utilisateur
    const user = await User.findOne({ email });
    if (user) {
      res.status(409).json({ message: "L'email existe déjà." });
      return;
    }

    // Génération des informations de sécurité
    const salt = uid2(64);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(64);

    // Gestion de l'avatar si fourni
    let avatarUrl: string | undefined;
    if (req.files && req.files.avatar) {
      const file = req.files.avatar;
      const base64String = convertToBase64(file as fileUpload.UploadedFile);
      const uploadResponse = await cloudinary.v2.uploader.upload(base64String);
      avatarUrl = uploadResponse.secure_url;
    }

    // Création de l'utilisateur
    const newUser = new User<UserProps>({
      email: email,
      account: {
        username: username,
        avatar: avatarUrl,
        address: address,
        phoneNumber: phoneNumber,
      },
      newsletter: req.body.newsletter || false,
      token: token,
      hash: hash,
      salt: salt,
    });

    await newUser.save();

    // Réponse de succès
    res.status(201).json({
      _id: newUser._id as string,
      token: newUser.token,
      account: {
        username: newUser.account.username,
      },
    });
  } catch (error: any) {
    console.error("Erreur lors de la création de l'utilisateur :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

const loginHandler = async (
  req: Request<{}, {}, SignupRequestBody>,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    // Validation des données de connexion
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: "Email invalide." });
      return;
    }

    if (!email || !password) {
      res.status(400).json({ message: "Paramètres manquants." });
      return;
    }

    // Recherche de l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Email incorrect." });
      return;
    }

    // Vérification du mot de passe
    const hashedPassword = SHA256(password + user.salt).toString(encBase64);
    if (hashedPassword !== user.hash) {
      res.status(400).json({ message: "Mot de passe incorrect." });
      return;
    }

    // Réponse de succès
    res.status(200).json({
      _id: user._id,
      token: user.token,
      account: user.account,
    });
  } catch (error: any) {
    console.error("Erreur lors de la connexion de l'utilisateur :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// Routes d'inscription et de connexion
router.post("/user/signup", fileUpload(), signupHandler);
router.post("/user/login", loginHandler);

export default router;
