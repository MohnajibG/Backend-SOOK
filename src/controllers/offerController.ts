import { Response, NextFunction } from "express";
import Offer from "../models/Offer";
import mongoose, { SortOrder } from "mongoose";
import { AuthenticatedRequest } from "../types/types";

// ==============================
// Publish Offer
// ==============================
export const publishOffer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "Utilisateur non authentifié." });
      return;
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

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      res.status(400).json({ message: "Le prix doit être un nombre positif." });
      return;
    }

    if (!pictures || !Array.isArray(pictures) || pictures.length === 0) {
      res.status(400).json({ message: "Veuillez ajouter au moins une image." });
      return;
    }

    const newOffer = new Offer({
      userId: new mongoose.Types.ObjectId(req.user._id.toString()), // ✅ .toString()
      title,
      description,
      price: parsedPrice,
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
      select: "account.username account.avatar",
    });

    res
      .status(201)
      .json({ message: "Offre publiée avec succès.", offer: populatedOffer });
  } catch (error) {
    console.error("🔥 Erreur lors de la publication de l'offre :", error);
    next(error);
  }
};

// ==============================
// Update Offer
// ==============================
export const updateOffer = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "ID d'offre invalide." });
      return;
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

    const updatedOffer = await Offer.findOneAndUpdate(
      { _id: id, userId: req.user?._id.toString() }, // ✅ .toString()
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
      res.status(404).json({ message: "Offre non trouvée ou non autorisée." });
      return;
    }

    res.status(200).json({
      message: "Offre mise à jour avec succès.",
      offer: updatedOffer,
    });
  } catch (error) {
    console.error("🔥 Erreur lors de la mise à jour de l'offre:", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// ==============================
// Delete Offer
// ==============================
export const deleteOffer = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "ID d'offre invalide." });
      return;
    }

    const deletedOffer = await Offer.findOneAndDelete({
      _id: id,
      userId: req.user?._id.toString(), // ✅ .toString()
    });

    if (!deletedOffer) {
      res.status(404).json({ message: "Offre non trouvée ou non autorisée." });
      return;
    }

    res.status(200).json({ message: "Offre supprimée avec succès." });
  } catch (error) {
    console.error("🔥 Erreur lors de la suppression de l'offre:", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// ==============================
// Get All Offers (pagination & tri)
// ==============================
export const getOffers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const sortField = (req.query.sort as string) || "createdAt";
    const sortOrder: SortOrder = req.query.order === "asc" ? 1 : -1;
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const totalOffers = await Offer.countDocuments();
    const offers = await Offer.find()
      .sort({ [sortField]: sortOrder })
      .limit(limit)
      .skip(skip)
      .populate("userId", "account.username account.avatar")
      .lean();

    res.status(200).json({
      offers,
      totalOffers,
      totalPages: Math.ceil(totalOffers / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("🔥 Erreur lors de la récupération des offres:", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// ==============================
// Search Offers
// ==============================
export const searchOffers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { keyword } = req.query;

  if (!keyword || typeof keyword !== "string") {
    res
      .status(400)
      .json({ message: "Un mot-clé est requis pour la recherche." });
    return;
  }

  try {
    // Échappe les caractères spéciaux de regex pour empêcher un pattern
    // à backtracking catastrophique (ReDoS) et pour que la recherche
    // traite le mot-clé comme du texte littéral.
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedKeyword, "i");
    const offers = await Offer.find({
      $or: [{ title: regex }, { description: regex }, { brand: regex }],
    }).populate("userId", "account.username account.avatar");

    res.status(200).json({ offers });
  } catch (error) {
    console.error("🔥 Erreur lors de la recherche des offres:", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// ==============================
// Get Offer By ID
// ==============================
export const getOfferById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "ID d'offre invalide." });
      return;
    }

    const offer = await Offer.findById(id).populate(
      "userId",
      "account.username account.avatar"
    );

    if (!offer) {
      res.status(404).json({ message: "Offre non trouvée." });
      return;
    }

    res.status(200).json({ offer });
  } catch (error) {
    console.error("🔥 Erreur lors de la récupération de l'offre:", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// ==============================
// Get My Offers (auth requis)
// ==============================

export const getMyOffers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "Non autorisé" });
      return;
    }

    const userId = new mongoose.Types.ObjectId(req.user._id.toString());

    const offers = await Offer.find({ userId: userId }).populate(
      "userId",
      "account.username account.avatar"
    );

    res.status(200).json({ offers });
  } catch (error) {
    console.error("🔥 Erreur dans getMyOffers:", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// ==============================
// Get Offers By UserId (public)
// ==============================
export const getOfferByUserId = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "ID utilisateur invalide." });
      return;
    }

    const offers = await Offer.find({ userId: userId.toString() }).populate(
      // ✅ .toString()
      "userId",
      "account.username account.avatar"
    );

    if (!offers || offers.length === 0) {
      res
        .status(404)
        .json({ message: "Aucune offre trouvée pour cet utilisateur." });
      return;
    }

    res.status(200).json({ offers });
  } catch (error) {
    console.error(
      "🔥 Erreur lors de la récupération des offres par userId:",
      error
    );
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
