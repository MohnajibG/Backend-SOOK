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

declare module "express-serve-static-core" {
  interface Request {
    files?: FileArray;
  }
}

// ==============================
// User Types
// ==============================
export interface UserPayload {
  _id: string;
  email?: string;
  account?: {
    username?: string;
    avatar?: string | null;
  };
}

// Pour Mongoose Document
export interface UserDocument extends Document {
  _id: string;
  email: string;
  account: {
    username: string;
    avatar?: string | null;
  };
  token: string;
  hash: string;
  salt: string;
}

// ==============================
// Cart Request Type
// ==============================
export interface CartRequest extends Request {
  params: { [key: string]: string };
  user?: UserPayload;
  body: Record<string, any>;
}

// ==============================
// Authenticated Request
// ==============================
export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export interface AuthUser {
  _id: string;
  email?: string;
  name?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
