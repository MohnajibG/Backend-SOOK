import express, { Request, Response, Router } from "express";
import fileUpload from "express-fileupload";
import isAuthenticated from "../middlewares/isAuthenticated";
import { UserProps } from "../models/User";
import updateUserData from "./updateUserData";

const router: Router = express.Router();

const updateProfileHandler = async (
  req: Request<{ userId: string }, {}, Partial<UserProps["account"]>>,
  res: Response
): Promise<void> => {
  try {
    const user = await updateUserData(
      req.params.userId,
      req.body,
      req.files.avatar as fileUpload.UploadedFile
    );

    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé." });
      return;
    }

    res.status(200).json({
      message: "Profil mis à jour avec succès.",
      user: {
        _id: user._id,
        ...user.account,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

const uploadAvatarHandler = async (
  req: Request<{ userId: string }, {}, {}>,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId || !req.files?.avatar) {
      res
        .status(400)
        .json({ message: "ID utilisateur ou fichier d'avatar manquant." });
      return;
    }

    const user = await updateUserData(
      userId,
      {},
      req.files.avatar as fileUpload.UploadedFile
    );

    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé." });
      return;
    }

    res.status(200).json({
      message: "Avatar mis à jour avec succès.",
      avatarUrl: user.account.avatar,
    });
  } catch (error) {
    console.error("Erreur lors du téléchargement de l'avatar :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

router.post("/user/upload-avatar", fileUpload(), uploadAvatarHandler);
router.put("/user/profile/:userId", isAuthenticated, updateProfileHandler);

export default router;
