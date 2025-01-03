import { Request, Response, NextFunction } from "express";
import Offer from "../models/Offer";
import { SortOrder } from "mongoose";
import { v2 as cloudinary } from "cloudinary";
// import fileUpload from "express-fileupload";

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

    // Validation des champs obligatoires
    if (!title || !description || !price || !city || !brand || !color) {
      res.status(400).json({
        message:
          "Veuillez remplir tous les champs obligatoires (titre, description, prix, ville, marque, couleur).",
      });
      return;
    }

    if (isNaN(price) || price <= 0) {
      res.status(400).json({ message: "Le prix doit être un nombre positif." });
      return;
    }

    // Vérification des fichiers
    if (!req.files || !req.files.pictures) {
      res.status(400).json({ message: "Veuillez ajouter au moins une image." });
      return;
    }

    const pictureUrls: string[] = [];
    const files = req.files.pictures;
    const fileArray = Array.isArray(files) ? files : [files];

    for (const file of fileArray) {
      try {
        const uploadedImage = await cloudinary.uploader.upload(
          file.tempFilePath
        );
        pictureUrls.push(uploadedImage.secure_url);
      } catch (err) {
        console.error("Erreur lors du téléchargement de l'image :", err);
        res.status(500).json({ message: "Échec de l'upload des images." });
        return;
      }
    }

    const newOffer = new Offer({
      userId,
      username,
      title,
      description,
      price,
      city,
      brand,
      size: size || null,
      color,
      condition: condition || null,
      pictures: pictureUrls,
    });

    await newOffer.save();

    res.status(201).json({
      message: "Offre publiée avec succès.",
      offer: newOffer,
    });
  } catch (error) {
    console.error("Erreur lors de la publication de l'offre :", error);
    next(error);
  }
};

// Fonction pour récupérer les offres
export const getOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sortField = (req.query.sort as string) || "createdAt";
    const sortOrder: SortOrder = req.query.order === "asc" ? 1 : -1;
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    if (isNaN(limit) || limit <= 0 || isNaN(page) || page <= 0) {
      res.status(400).json({
        message:
          "Les paramètres 'limit' et 'page' doivent être des nombres positifs.",
      });
      return;
    }

    const sortOption: Record<string, SortOrder> = { [sortField]: sortOrder };
    const totalOffers = await Offer.countDocuments();
    const offers = await Offer.find()
      .sort(sortOption)
      .limit(limit)
      .skip(skip)
      .populate("userId", "username avatar");

    res.status(200).json({
      offers,
      totalOffers,
      totalPages: Math.ceil(totalOffers / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des offres:", error);
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
    const offers = await Offer.find({
      $or: [{ title: regex }, { description: regex }, { brand: regex }],
    });

    res.status(200).json({ offers });
  } catch (error) {
    console.error("Erreur lors de la recherche des offres:", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

export const getOfferById = async (req: Request, res: Response) => {
  try {
    const offer = await Offer.findById(req.params.offerId).populate(
      "userId",
      "username avatar"
    );

    if (!offer) {
      res.status(404).json({ message: "Offre non trouvée." });
      return;
    }

    res.status(200).json({ offer });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'offre :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
