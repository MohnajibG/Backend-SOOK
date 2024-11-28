import { Document, model, Schema } from "mongoose";

// Définir l'interface IUser
export interface UserProps {
  email: string;
  password: string;
  account: {
    username: string;
    avatar?: string; // Optionnel, pas besoin de valeur par défaut ici si tu la gères côté front-end
    address?: string;
    phoneNumber?: string; // Utilisation de 'string' pour le numéro de téléphone
    country?: string;
  };
  newsletter: boolean; // Optionnel, la valeur par défaut est false
  token: string;
  hash: string;
  salt: string;
}

// Définir le schéma de l'utilisateur en utilisant Mongoose
const UserSchema = new Schema<UserProps & Document>(
  {
    email: {
      type: String,
      required: true,
      unique: true, // Assure l'unicité de l'email
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Veuillez fournir un email valide.",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: [8, "Le mot de passe doit contenir au moins 8 caractères."],
    },

    account: {
      username: { type: String, required: true },
      avatar: { type: String, default: null }, // Avatar optionnel avec valeur par défaut
      adress: { type: String, default: null }, // Ajout de la validation pour l'adresse
      phoneNumber: { type: String, default: null }, // 'phoneNumber' en tant que String
      country: { type: String, default: null },
    },
    newsletter: { type: Boolean, default: false }, // Valeur par défaut pour 'newsletter'
    token: { type: String },
    hash: { type: String },
    salt: { type: String },
  },
  { timestamps: true }
);

// Créer le modèle utilisateur
const User = model<UserProps & Document>("User", UserSchema);

export default User;
