import User, { UserProps } from "../models/User";
import fileUpload from "express-fileupload";
import cloudinary from "cloudinary";

const convertToBase64 = (file: fileUpload.UploadedFile): string =>
  `data:${file.mimetype};base64,${file.data.toString("base64")}`;

const updateUserData = async (
  userId: string,
  data: Partial<UserProps["account"]>,
  file?: fileUpload.UploadedFile
): Promise<UserProps | null> => {
  // Récupération de l'utilisateur avec vérification de type
  const user = await User.findById(userId).exec();
  if (!user) return null;

  // Mise à jour des données de l'utilisateur si elles sont fournies
  Object.assign(user.account, data);

  // Si un fichier est fourni, mettre à jour l'avatar
  if (file) {
    const base64String = convertToBase64(file);
    const uploadResponse = await cloudinary.v2.uploader.upload(base64String);
    user.account.avatar = uploadResponse.secure_url;
  }

  await user.save(); // Sauvegarder les modifications
  return user;
};
export default updateUserData;
