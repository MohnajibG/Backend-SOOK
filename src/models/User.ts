import { Document, model, Schema } from "mongoose";

// Définir l'interface UserProps
export interface UserProps {
  email: string;
  password: string;
  account: {
    username: string;
    avatar?: string; // Optionnel, géré côté front-end si nécessaire
    address?: string; // Correction de 'adress' en 'address'
    phoneNumber?: string;
    country?: string;
    sexe?: "Homme" | "Femme" | "Autre"; // Utilisation d'un enum-like pour les valeurs attendues
    dateOfBorn?: string; // Optionnel, mais validé au besoin
  };
  newsletter: boolean;
  token?: string;
  hash: string;
  salt: string;
}

// Définir le schéma de l'utilisateur en utilisant Mongoose
const UserSchema = new Schema<UserProps & Document>(
  {
    email: {
      type: String,
      required: [true, "L'email est requis."],
      unique: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Veuillez fournir un email valide.",
      ],
    },
    password: {
      type: String,
      required: [true, "Le mot de passe est requis."],
      minlength: [8, "Le mot de passe doit contenir au moins 8 caractères."],
    },
    account: {
      username: {
        type: String,
        required: [true, "Le nom d'utilisateur est requis."],
      },
      avatar: { type: String, default: null },
      address: { type: String, default: null },
      phoneNumber: { type: String, default: null },
      country: { type: String, default: null },
      sexe: {
        type: String,
        enum: ["Homme", "Femme", "Autre"],
        default: "Autre",
      },
      dateOfBorn: {
        type: String,
        match: [
          /^\d{4}-\d{2}-\d{2}$/,
          "La date de naissance doit être au format YYYY-MM-DD.",
        ],
        default: null,
      },
    },
    newsletter: { type: Boolean, default: false },
    token: { type: String, default: null },
    hash: { type: String, required: true },
    salt: { type: String, required: true },
  },
  { timestamps: true }
);

// Créer le modèle utilisateur
const User = model<UserProps & Document>("User", UserSchema);

export default User;
