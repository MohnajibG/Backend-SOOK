import { Request } from "express";
import "express-fileupload";
import { FileArray } from "express-fileupload";
import { Document } from "mongoose";

// ==============================
// Signup / Auth Types
// ==============================
export interface SignupRequestBody {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  address?: string;
  phoneNumber?: string;
  newsletter?: boolean;
  avatar?: any; // Peut être un fichier ou une chaîne
  country?: string;
  sexe?: "Homme" | "Femme" | "Autre";
  dateOfBorn?: string;
}

// ==============================
// Update Profile Params
// ==============================
export interface UpdateProfileParams {
  userId: string;
}

// ==============================
// Express-FileUpload Typing
// ==============================
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

// Étendre Express.Request pour inclure `files`
declare module "express-serve-static-core" {
  interface Request {
    files?: FileArray;
  }
}

// ==============================
// User Types
// ==============================
export interface User {
  _id: string;
  name?: string;
  email?: string;
  token?: string;
}

export interface UserDocument extends Document {
  _id: string;
  username: string;
  avatar?: string;
}

// ==============================
// Cart Request Type
// ==============================
export interface CartRequest extends Request {
  params: { [key: string]: string }; // Peut contenir userId, id, productId, etc.
  user?: User;
  body: Record<string, any>;
}

// ==============================
// Authenticated Request
// ==============================
export interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}
