import { Request, Response, NextFunction } from "express";
import cloudinary from "cloudinary";
import Offer from "../models/Offer";
import { UploadedFile } from "express-fileupload"; // Type pour le fichier uploadé

// Configuration de Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Fonction pour publier l'offre avec plusieurs images
export const publishOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const {
    userId,
    title,
    description,
    price,
    condition,
    city,
    brand,
    size,
    color,
  } = req.body;

  if (
    !userId ||
    !title ||
    !description ||
    !price ||
    !condition ||
    !city ||
    !brand ||
    !size ||
    !color
  ) {
    res.status(400).json({ message: "Tous les champs sont requis." });
    return;
  }

  try {
    // Tableau pour stocker les URLs des images
    const pictureUrls: string[] = [];

    // Vérifier si des fichiers ont été uploadés
    if (req.files && req.files.pictures) {
      const files = req.files.pictures as UploadedFile | UploadedFile[]; // Plusieurs fichiers possibles

      if (Array.isArray(files)) {
        // Si plusieurs fichiers ont été envoyés
        for (const file of files) {
          const result = await cloudinary.v2.uploader.upload(file.tempFilePath);
          pictureUrls.push(result.secure_url); // Ajouter l'URL de chaque image
        }
      } else {
        // Si un seul fichier a été envoyé
        const result = await cloudinary.v2.uploader.upload(
          (files as UploadedFile).tempFilePath
        );
        pictureUrls.push(result.secure_url); // Ajouter l'URL de l'image
      }
    }

    // Création de l'offre dans la base de données
    const newOffer = new Offer({
      userId,
      title,
      description,
      price,
      condition,
      city,
      brand,
      size,
      color,
      pictures: pictureUrls, // Ajouter les URLs des images
    });

    await newOffer.save();

    res.status(200).json({
      message: "Offre publiée avec succès.",
      offer: newOffer,
    });
  } catch (error) {
    console.error("Erreur lors de la publication de l'offre:", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
