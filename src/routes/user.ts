import express, { Request, Response, Router } from "express"; // Importation d'Express et des types nécessaires pour les requêtes et réponses
import uid2 from "uid2"; // Importation du module `uid2` pour générer des tokens aléatoires
import SHA256 from "crypto-js/sha256"; // Importation de la fonction de hashage SHA256 de `crypto-js`
import encBase64 from "crypto-js/enc-base64"; // Importation de l'encodage Base64 pour convertir le hash en une chaîne lisible
import User, { UserProps } from "../models/User"; // Importation du modèle `User` et de l'interface `UserProps` pour définir les propriétés d'un utilisateur

// Interface pour la requête de création d'utilisateur
interface SignupRequestBody {
  username: string; // Le nom d'utilisateur
  email: string; // L'email de l'utilisateur
  password: string; // Le mot de passe de l'utilisateur
  confirmePassword: string; // La confirmation du mot de passe
  avatar?: string; // L'avatar de l'utilisateur (facultatif)
  newsletter?: boolean; // Abonnement à la newsletter (facultatif)
  adress: string;
  phoneNumber: string;
}

// Initialisation du routeur d'Express
const router: Router = express.Router(); // Création d'une instance de routeur pour gérer les routes

// Middleware pour la création d'un utilisateur
const signupHandler = async (
  req: Request<{}, {}, SignupRequestBody>, // Requête avec les données envoyées dans le corps (body) de la requête
  res: Response // Réponse à envoyer au client
) => {
  const {
    username,
    email,
    password,
    confirmePassword,
    avatar,
    newsletter,
    adress,
    phoneNumber,
  } = req.body; // Déstructure les données du corps de la requête

  try {
    // Validation des mots de passe
    if (password !== confirmePassword) {
      // Si le mot de passe et sa confirmation ne correspondent pas
      res
        .status(400) // Envoie un statut 400 (Bad Request)
        .json({ message: "Les mots de passe ne sont pas identiques." }); // Réponse avec un message d'erreur
      return; // Arrête l'exécution du middleware
    }

    // Validation des champs obligatoires
    if (!username || !email || !password) {
      // Si l'un des champs obligatoires est manquant
      res.status(400).json({ message: "Paramètres manquants." }); // Réponse avec un message d'erreur
      return; // Arrête l'exécution du middleware
    }

    // Vérification de la validité de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expression régulière pour valider l'email
    if (!emailRegex.test(email)) {
      // Si l'email ne correspond pas au format
      res.status(400).json({ message: "Email invalide." }); // Réponse avec un message d'erreur
      return; // Arrête l'exécution du middleware
    }

    // Vérification de l'existence de l'email dans la base de données
    const user = await User.findOne({ email: email }); // Recherche un utilisateur ayant cet email
    if (user) {
      // Si un utilisateur est trouvé
      res.status(409).json({ message: "L'email existe déjà." }); // Réponse avec un message d'erreur (conflit)
      return; // Arrête l'exécution du middleware
    }

    // Création des informations de sécurité pour l'utilisateur
    const salt = uid2(64); // Génère un sel aléatoire de 64 caractères pour le hashage
    const hash = SHA256(password + salt).toString(encBase64); // Hashage du mot de passe avec le sel, puis encodage en Base64
    const token = uid2(64); // Génère un token d'utilisateur de 64 caractères

    // Création d'un nouvel utilisateur avec les données
    const newUser = new User<UserProps>({
      email: email, // L'email de l'utilisateur
      account: {
        username: username, // Le nom d'utilisateur
        avatar: avatar, // L'avatar de l'utilisateur
        adress: adress,
        phoneNumber: phoneNumber,
      },
      newsletter: newsletter || false, // L'abonnement à la newsletter, défaut à `false` si non fourni
      token: token, // Le token généré pour l'utilisateur
      hash: hash, // Le mot de passe hashé
      salt: salt, // Le sel utilisé pour le hashage
    });

    // Sauvegarde de l'utilisateur dans la base de données
    await newUser.save(); // Sauvegarde du nouvel utilisateur

    // Réponse au client avec les informations de l'utilisateur
    res.status(201).json({
      _id: newUser._id, // L'ID de l'utilisateur dans la base de données
      token: newUser.token, // Le token généré pour l'utilisateur
      account: {
        username: newUser.account.username, // Le nom d'utilisateur
      },
    });
  } catch (error: any) {
    // Si une erreur se produit
    console.error("Erreur lors de la création de l'utilisateur :", error); // Affiche l'erreur dans la console
    res.status(500).json({ message: "Erreur interne du serveur." }); // Réponse avec un statut 500 (erreur serveur)
  }
};

// Middleware pour la connexion d'un utilisateur
const loginHandler = async (
  req: Request<{}, {}, SignupRequestBody>, // Requête avec les données envoyées dans le corps (body) de la requête
  res: Response // Réponse à envoyer au client
) => {
  try {
    const { email, password } = req.body; // Récupère l'email et le mot de passe du corps de la requête

    // Vérification de la validité de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expression régulière pour valider l'email
    if (!emailRegex.test(email)) {
      // Si l'email ne correspond pas au format
      res.status(400).json({ message: "Email invalide." }); // Réponse avec un message d'erreur
      return; // Arrête l'exécution du middleware
    }

    // Validation des champs obligatoires
    if (!email || !password) {
      // Si l'email ou le mot de passe est manquant
      res.status(400).json({ message: "Paramètres manquants." }); // Réponse avec un message d'erreur
      return; // Arrête l'exécution du middleware
    }

    // Recherche de l'utilisateur par email dans la base de données
    const user = await User.findOne({ email }); // Recherche un utilisateur avec l'email donné
    if (!user) {
      // Si l'utilisateur n'est pas trouvé
      res.status(400).json({ message: "Email incorrect." }); // Réponse avec un message d'erreur
      return; // Arrête l'exécution du middleware
    }

    // Validation du mot de passe
    const hashedPassword = SHA256(password + user.salt).toString(encBase64); // Hashage du mot de passe avec le sel
    if (hashedPassword !== user.hash) {
      // Si le mot de passe ne correspond pas
      res.status(400).json({ message: "Mot de passe incorrect." }); // Réponse avec un message d'erreur
      return; // Arrête l'exécution du middleware
    } else {
      // Réponse réussie avec les informations de l'utilisateur
      res.status(200).json({
        _id: user._id, // L'ID de l'utilisateur
        token: user.token, // Le token de l'utilisateur
        account: user.account, // Les informations du compte utilisateur
      });
    }
  } catch (error: any) {
    // Si une erreur se produit
    console.error("Erreur lors de la connexion de l'utilisateur :", error); // Affiche l'erreur dans la console
    res.status(500).json({ message: "Erreur interne du serveur." }); // Réponse avec un statut 500 (erreur serveur)
  }
};

// Utilisation du middleware pour la route de création d'utilisateur
router.post("/user/signup", signupHandler); // La route POST pour créer un utilisateur et appelle `signupHandler`

// Utilisation du middleware pour la route de connexion d'utilisateur
router.post("/user/login", loginHandler); // La route POST pour connecter un utilisateur et appelle `loginHandler`

export default router; // Exportation du routeur pour l'utiliser dans d'autres fichiers
