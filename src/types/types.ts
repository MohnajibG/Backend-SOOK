export interface SignupRequestBody {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  address?: string;
  phoneNumber?: string;
  newsletter?: boolean;
  avatar?: any; // Facultatif : peut être un fichier ou une chaîne
  country: string;
}

export interface UpdateProfileParams {
  userId: string; // Ici, on spécifie que userId est un string dans les paramètres de la route
}
