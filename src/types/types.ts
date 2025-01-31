import { Request } from "express";
import "express-fileupload";
import { FileArray } from "express-fileupload";

export interface SignupRequestBody {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  address?: string;
  phoneNumber?: string;
  newsletter?: boolean;
  avatar?: any; // Facultatif : peut être un fichier ou une chaîne
  country?: string;
  sexe?: "Homme" | "Femme" | "Autre";
  dateOfBorn?: string;
}

export interface UpdateprofileUpdateParams {
  userId: string; // Ici, on spécifie que userId est un string dans les paramètres de la route
}

declare module "express-fileupload" {
  interface UploadedFile {
    name: string;
    mv: {
      (path: string, callback: (err: any) => void): void;
      (path: string): Promise<void>;
    };
    mimetype: string;
    size: number;
    tempFilePath: string;
  }

  interface FileArray {
    pictures?: UploadedFile | UploadedFile[];
  }
}

declare module "express-serve-static-core" {
  interface Request {
    files?: FileArray;
  }
}

export interface User {
  _id: string;
  name?: string;
  email?: string;
  token?: string;
}

export interface CartPropos extends Request {
  params: { [key: string]: string }; // Permet d'accepter différents paramètres (id, userId...)
  user?: User;
  body: Record<string, any>; // Permet de gérer différents types de corps de requête
}
export interface UserDocument extends Document {
  _id: string;
  username: string;
  avatar?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}
