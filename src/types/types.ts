import "express-fileupload";
import { FileArray } from "express-fileupload";

const stripe = require("stripe")("pmc_1QgqTfP7qV02XPrQTtNEe4UT");

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
export interface AuthenticatedRequest {
  headers: any;
  params: { id: any; userId: string };

  body: { userId: string; prodeuctId: any; quantity: any };
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
}
