import { Request, Response, NextFunction } from "express";
import cloudinary from "cloudinary";
import Offer from "../models/Offer";
import { SortOrder } from "mongoose"; // Import du type correct

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
  const { title, description, price, condition, city, brand, size, color } =
    req.body;

  if (!title || !price || !city || !brand || !size || !color) {
    res.status(400).json({ message: "Tous les champs sont requis." });
    return;
  }

  try {
    const pictureUrls: string[] = [];

    if (req.files && req.files.pictures) {
      const files = req.files.pictures;

      if (Array.isArray(files)) {
        const uploadResults = await Promise.all(
          files.map((file) => cloudinary.v2.uploader.upload(file.tempFilePath))
        );
        pictureUrls.push(...uploadResults.map((result) => result.secure_url));
      } else {
        const result = await cloudinary.v2.uploader.upload(
          (files as any).tempFilePath
        );
        pictureUrls.push(result.secure_url);
      }
    }

    const newOffer = new Offer({
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
    console.log("Erreur lors de la publication de l'offre:", error);
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
    // Récupération des paramètres de tri et pagination
    const sortField = (req.query.sort as string) || "createdAt";
    const sortOrder: SortOrder = req.query.order === "asc" ? 1 : -1;
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Création de l'objet de tri
    const sortOption: Record<string, SortOrder> = { [sortField]: sortOrder };

    // Récupération des offres avec tri, pagination et limite
    const offers = await Offer.find().sort(sortOption).limit(limit).skip(skip);

    if (!offers || offers.length === 0) {
      res.status(404).json({ message: "Aucune offre trouvée." });
      return;
    }

    res.status(200).json({ offers });
  } catch (error) {
    console.log("Erreur lors de la récupération des offres:", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// Fonction pour rechercher des offres
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
    console.log("Erreur lors de la recherche des offres :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
