import { Request, Response, NextFunction } from "express";
import cloudinary from "cloudinary";
import Offer from "../models/Offer";

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
    const pictureUrls: string[] = [];

    // Vérifier si des fichiers ont été uploadés
    if (req.files && req.files.pictures) {
      const files = req.files.pictures;

      if (Array.isArray(files)) {
        // Utilisation de Promise.all pour traiter les fichiers en parallèle
        const uploadResults = await Promise.all(
          files.map((file) => cloudinary.v2.uploader.upload(file.tempFilePath))
        );
        pictureUrls.push(...uploadResults.map((result) => result.secure_url));
      } else {
        // Un seul fichier a été envoyé
        const result = await cloudinary.v2.uploader.upload(
          (files as any).tempFilePath
        );
        pictureUrls.push(result.secure_url);
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
      pictures: pictureUrls,
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

// Fonction pour récupérer toutes les offres
export const getOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const offers = await Offer.find();

    if (!offers || offers.length === 0) {
      res.status(404).json({ message: "Aucune offre trouvée." });
      return;
    }

    res.status(200).json({ offers });
  } catch (error) {
    console.error("Erreur lors de la récupération des offres:", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

export const searchOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { keyword } = req.query;

  if (!keyword || typeof keyword !== "string") {
    res
      .status(400)
      .json({ message: "Un mot-clé est requis pour la recherche." });
    return;
  }

  try {
    const regex = new RegExp(keyword, "i");
    const offers = await Offer.find({ title: regex });

    if (!offers || offers.length === 0) {
      res.status(404).json({ message: "Aucune offre correspondante trouvée." });
      return;
    }

    res.status(200).json({ offers });
  } catch (error) {
    console.error("Erreur lors de la recherche des offres :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
