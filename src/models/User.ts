import { Document, model, Schema } from "mongoose";

// ==============================
// Interfaces
// ==============================
export interface UserProps {
  email: string;
  account: {
    username: string;
    avatar?: string;
    sexe?: "Homme" | "Femme" | "Autre";
    dateOfBorn?: Date; // 👈 stocker en Date plutôt que string
    phoneNumber?: string;
    address?: string;
    postalCode?: string;
    country?: string;
  };
  newsletter: boolean;
  token?: string;
  hash: string;
  salt: string;
}

export interface UserDocument extends UserProps, Document {}

// ==============================
// Schéma
// ==============================
const UserSchema = new Schema<UserDocument>(
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

    account: {
      username: {
        type: String,
        required: [true, "Le nom d'utilisateur est requis."],
      },
      avatar: { type: String, default: null },
      address: { type: String, default: null },
      phoneNumber: {
        type: String,
        match: [
          /^(\+33|0)[1-9](\d{2}){4}$/,
          "Veuillez entrer un numéro de téléphone valide.",
        ],
        default: null,
      },
      postalCode: {
        type: String,
        match: [
          /^[0-9]{5}$/,
          "Veuillez entrer un code postal valide (5 chiffres).",
        ],
        default: null,
      },
      country: { type: String, default: null },
      sexe: {
        type: String,
        enum: ["Homme", "Femme", "Autre"],
        default: "Autre",
      },
      dateOfBorn: {
        type: Date, // 👈 plus pratique en Date
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

// ==============================
// Modèle
// ==============================
const User = model<UserDocument>("User", UserSchema);
export default User;
