"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uid2_1 = __importDefault(require("uid2"));
const sha256_1 = __importDefault(require("crypto-js/sha256"));
const enc_base64_1 = __importDefault(require("crypto-js/enc-base64"));
const User_1 = __importDefault(require("../models/User")); // Assurez-vous que le chemin est correct
// Initialisation du routeur
const router = express_1.default.Router();
// Route pour la création d'un utilisateur
router.post("/user/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password, confirmePassword, avatar, newsletter } = req.body;
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
        const user = yield User_1.default.findOne({ email: email });
        if (user) {
            return res.status(409).json({ message: "L'email existe déjà." });
        }
        // Création des informations de sécurité
        const salt = (0, uid2_1.default)(64);
        const hash = (0, sha256_1.default)(password + salt).toString(enc_base64_1.default);
        const token = (0, uid2_1.default)(64);
        // Création d'un nouvel utilisateur
        const newUser = new User_1.default({
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
        yield newUser.save();
        // Réponse au client
        res.status(201).json({
            _id: newUser._id,
            token: newUser.token,
            account: {
                username: newUser.account.username,
            },
        });
    }
    catch (error) {
        console.error("Erreur lors de la création de l'utilisateur :", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
}));
// Route pour la connexion d'un utilisateur
router.post("/user/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Validation des champs obligatoires
        if (!email || !password) {
            return res.status(400).json({ message: "Paramètres manquants." });
        }
        // Recherche de l'utilisateur par email
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            return res
                .status(400)
                .json({ message: "Email ou mot de passe incorrect." });
        }
        // Validation du mot de passe
        const hashedPassword = (0, sha256_1.default)(password + user.salt).toString(enc_base64_1.default);
        if (hashedPassword === user.hash) {
            // Réponse en cas de succès
            res.status(200).json({
                _id: user._id,
                token: user.token,
                account: user.account,
            });
        }
        else {
            // Réponse en cas d'erreur de mot de passe
            return res
                .status(400)
                .json({ message: "Email ou mot de passe incorrect." });
        }
    }
    catch (error) {
        console.error("Erreur lors de la connexion de l'utilisateur :", error);
        return res.status(500).json({ message: "Erreur interne du serveur." });
    }
}));
exports.default = router;
