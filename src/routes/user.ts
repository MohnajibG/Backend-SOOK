// Importation des modules nécessaires
import express, { Request, Response, Router } from "express"; // Importation d'Express et des types nécessaires
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
}

// Initialisation du routeur d'Express
const router: Router = express.Router(); // Création d'une instance de routeur pour gérer les routes

// Middleware pour la création d'un utilisateur
const signupHandler = async (
  req: Request<{}, {}, SignupRequestBody>, // Requête avec les données envoyées dans le corps (body) de la requête
  res: Response // Réponse à envoyer au client
) => {
  const { username, email, password, confirmePassword, avatar, newsletter } =
    req.body; // Déstructure les données du corps de la requête

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
      return;
    }

    // Vérification de la validité de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expression régulière pour valider l'email
    if (!emailRegex.test(email)) {
      // Si l'email ne correspond pas au format
      res.status(400).json({ message: "Email invalide." }); // Réponse avec un message d'erreur
      return;
    }

    // Vérification de l'existence de l'email dans la base de données
    const user = await User.findOne({ email: email }); // Recherche un utilisateur ayant cet email
    if (user) {
      // Si un utilisateur est trouvé
      res.status(409).json({ message: "L'email existe déjà." }); // Réponse avec un message d'erreur (conflit)
      return;
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

// Utilisation du middleware pour la route
router.post("/user/signup", signupHandler); // La route POST pour créer un utilisateur et appelle `signupHandler`

export default router; // Exportation du routeur pour l'utiliser dans d'autres fichiers
