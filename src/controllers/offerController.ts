import { Request, Response, NextFunction } from "express";
import Offer from "../models/Offer";
import { SortOrder } from "mongoose";

export const publishOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = (req.user as any)._id;
  const username = (req.user as any).username;
  try {
    if (!req.user) {
      res.status(401).json({ message: "Utilisateur non authentifié." });
    }

    const {
      title,
      description,
      price,
      city,
      brand,
      size,
      color,
      condition,
      pictures,
    } = req.body;

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

    if (!pictures || !Array.isArray(pictures) || pictures.length === 0) {
      res.status(400).json({ message: "Veuillez ajouter au moins une image." });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "Utilisateur non authentifié." });
      return;
    }

    const newOffer = new Offer({
      userId: (req.user as any)._id,
      username: (req.user as any).username,
      title,
      description,
      price,
      city,
      brand,
      size: size || null,
      color,
      condition: condition || null,
      pictures,
    });

    await newOffer.save();

    const populatedOffer = await Offer.findById(newOffer._id).populate({
      path: "userId",
      select: "username avatar",
    });

    res
      .status(201)
      .json({ message: "Offre publiée avec succès.", offer: populatedOffer });
  } catch (error) {
    console.error("Erreur lors de la publication de l'offre :", error);
    next(error);
  }
};

export const getOffers = async (req: Request, res: Response): Promise<void> => {
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
      .populate({
        path: "userId",
        select: "account.username account.avatar",
        model: "User",
      }) // ✅
      .lean();

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
    const offer = await Offer.findById(req.params.id)
      .populate({
        path: "userId",
        select: "account.username account.avatar",
        model: "User",
      })
      .lean();
    if (!offer) {
      res.status(404).json({ message: "Offre non trouvée." });
      return;
    }

    res.status(200).json({ offer });
  } catch (error) {
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
export const updateOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      price,
      city,
      brand,
      size,
      color,
      condition,
      pictures,
    } = req.body;

    const updatedOffer = await Offer.findByIdAndUpdate(
      id,
      {
        title,
        description,
        price,
        city,
        brand,
        size,
        color,
        condition,
        pictures,
      },
      { new: true }
    );

    if (!updatedOffer) {
      res.status(404).json({ message: "Offre non trouvée." });
    }

    res
      .status(200)
      .json({ message: "Offre mise à jour avec succès.", offer: updatedOffer });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'offre:", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
export const deleteOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedOffer = await Offer.findByIdAndDelete(id);
    if (!deletedOffer) {
      res.status(404).json({ message: "Offre non trouvée." });
    }

    res.status(200).json({ message: "Offre supprimée avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'offre:", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
export const getMyOffer = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Utilisateur non authentifié." });
      return;
    }
    console.log("DEBUG req.user:", req.user);

    const userId = (req.user as any)._id;

    const offers = await Offer.find({ userId }).populate({
      path: "userId",
      select: "account.username account.avatar",
      model: "User",
    });
    console.log("DEBUG Authorization Header:", req.headers.authorization);

    res.status(200).json({ offers });
  } catch (error) {
    console.error("Erreur lors de la récupération des offres:", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
