import { Document, model, Schema } from "mongoose";

// Définir l'interface IUser
interface UserProps {
  email: string;
  account: {
    username: string;
    avatar?: string;
  };
  newsletter?: boolean;
  token: string;
  hash: string;
  salt: string;
}

// Définir le schéma de l'utilisateur en utilisant Mongoose
const UserSchema = new Schema<UserProps & Document>({
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
const User = model<UserProps & Document>("User", UserSchema);

export default User;
