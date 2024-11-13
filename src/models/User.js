"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Définir le schéma de l'utilisateur en utilisant Mongoose
const UserSchema = new mongoose_1.Schema({
    email: { type: String, required: true },
    account: {
        username: { type: String, required: true },
        avatar: { type: String, default: null }, // Si l'avatar est optionnel, définir une valeur par défaut
    },
    newsletter: { type: Boolean, default: false }, // Valeur par défaut si optionnel
    token: { type: String, required: true },
    hash: { type: String, required: true },
    salt: { type: String, required: true },
});
// Créer le modèle utilisateur
const User = (0, mongoose_1.model)("User", UserSchema);
exports.default = User;
