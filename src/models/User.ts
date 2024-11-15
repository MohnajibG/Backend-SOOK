import { Document, model, Schema } from "mongoose";

// Définir l'interface IUser
export interface UserProps {
  email: string;
  account: {
    username: string;
    avatar?: string; // Optionnel, pas besoin de valeur par défaut ici si tu la gères côté front-end
    adress: string;
    phoneNumber: string; // Utilisation de 'string' pour le numéro de téléphone
  };
  newsletter?: boolean; // Optionnel, la valeur par défaut est false
  token: string;
  hash: string;
  salt: string;
}

// Définir le schéma de l'utilisateur en utilisant Mongoose
const UserSchema = new Schema<UserProps & Document>({
  email: { type: String, required: true },
  account: {
    username: { type: String, required: true },
    avatar: { type: String, default: null }, // Avatar optionnel avec valeur par défaut
    adress: { type: String, required: true }, // Ajout de la validation pour l'adresse
    phoneNumber: { type: String, required: true }, // 'phoneNumber' en tant que String
  },
  newsletter: { type: Boolean, default: false }, // Valeur par défaut pour 'newsletter'
  token: { type: String, required: true },
  hash: { type: String, required: true },
  salt: { type: String, required: true },
});

// Créer le modèle utilisateur
const User = model<UserProps & Document>("User", UserSchema);

export default User;
