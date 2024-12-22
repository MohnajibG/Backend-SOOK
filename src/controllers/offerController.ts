import { Request, Response, NextFunction } from "express";
import cloudinary from "cloudinary";
import Offer from "../models/Offer";
import { SortOrder } from "mongoose";

// Configuration Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Fonction pour publier une offre
export const publishOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      price,
      city,
      brand,
      size,
      color,
      condition,
      userId,
      username,
    } = req.body;

    // // Validation des champs obligatoires
    // if (!title || !description || !price || !city || !brand || !color) {
    //   res.status(400).json({
    //     message:
    //       "Veuillez remplir tous les champs obligatoires (titre, description, prix, ville, marque, couleur).",
    //   });
    //   return;
    // }

    // Vérification des fichiers
    if (!req.files || !req.files.pictures) {
      res.status(400).json({ message: "Veuillez ajouter au moins une image." });
      return;
    }

    const pictureUrls: string[] = [];

    // Gestion des fichiers avec express-fileupload
    const files = req.files.pictures;
    const fileArray = Array.isArray(files) ? files : [files]; // Gère un ou plusieurs fichiers

    for (const file of fileArray) {
      const uploadedImage = await cloudinary.v2.uploader.upload(
        file.tempFilePath
      );
      pictureUrls.push(uploadedImage.secure_url);
    }

    // Création et enregistrement de l'offre
    const newOffer = new Offer({
      userId,
      username,
      title,
      description,
      price,
      city,
      brand,
      size,
      color,
      condition,
      pictures: pictureUrls,
    });

    await newOffer.save();

    res.status(201).json({
      message: "Offre publiée avec succès.",
      offer: newOffer,
    });
  } catch (error) {
    console.error("Erreur lors de la publication de l'offre :", error);
    next(error); // Transmet l'erreur au middleware suivant
  }
};

// Fonction pour récupérer toutes les offres avec tri et pagination
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

    // Validation des paramètres limit et page
    if (isNaN(limit) || limit <= 0) {
      res
        .status(400)
        .json({ message: "Le paramètre 'limit' doit être un nombre positif." });
      return;
    }

    if (isNaN(page) || page <= 0) {
      res
        .status(400)
        .json({ message: "Le paramètre 'page' doit être un nombre positif." });
      return;
    }

    // Création de l'objet de tri
    const sortOption: Record<string, SortOrder> = { [sortField]: sortOrder };

    // Récupération des offres avec tri, pagination et limite
    const offers = await Offer.find()
      .sort(sortOption)
      .limit(limit)
      .skip(skip)
      .populate("userId", "username avatar");

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

// Fonction pour rechercher des offres par mot-clé
export const searchOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { keyword } = req.query;

  // Validation du mot-clé
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
    console.error("Erreur lors de la recherche des offres:", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
