import { Document, model, Schema } from "mongoose";

// Définir l'interface UserProps
export interface UserProps {
  email: string;
  password: string;
  account: {
    avatar?: string; // Optionnel, géré côté front-end si nécessaire
    username: string;
    sexe?: "Homme" | "Femme" | "Autre"; // Utilisation d'un enum-like pour les valeurs attendues
    dateOfBorn?: string; // Optionnel, mais validé au besoin
    phoneNumber?: string;
    address?: string; // Correction de 'adress' en 'address'
    postalCode?: string;
    country?: string;
  };
  newsletter: boolean;
  token?: string;
  hash: string;
  salt: string;
}

/// Définir le schéma de l'utilisateur en utilisant Mongoose.
const UserSchema = new Schema<UserProps & Document>(
  {
    email: {
      type: String,
      required: [true, "L'email est requis."], // Champ obligatoire avec message d'erreur personnalisé.
      unique: true, // Garantir que l'email est unique.
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, // Validation du format d'email.
        "Veuillez fournir un email valide.",
      ],
    },

    account: {
      username: {
        type: String,
        required: [true, "Le nom d'utilisateur est requis."], // Nom d'utilisateur obligatoire.
      },
      avatar: { type: String, default: null }, // Valeur par défaut si non spécifiée.
      address: { type: String, default: null },
      phoneNumber: { type: String, default: null },
      postalCode: { type: String, default: null },
      country: { type: String, default: null },
      sexe: {
        type: String,
        enum: ["Homme", "Femme", "Autre"], // Limitation des valeurs possibles.
        default: "Autre", // Valeur par défaut si aucune n'est fournie.
      },
      dateOfBorn: {
        type: String,
        match: [
          /^\d{4}-\d{2}-\d{2}$/, // Validation du format de la date.
          "La date de naissance doit être au format YYYY-MM-DD.",
        ],
        default: null,
      },
    },
    newsletter: { type: Boolean, default: false }, // Champ booléen avec une valeur par défaut.
    token: { type: String, default: null }, // Jeton optionnel.
    hash: { type: String, required: true }, // Hash obligatoire.
    salt: { type: String, required: true }, // Sel obligatoire.
  },
  { timestamps: true } // Ajoute automatiquement les champs createdAt et updatedAt.
);

// Création du modèle utilisateur basé sur le schéma.
const User = model<UserProps & Document>("User", UserSchema);

export default User;
