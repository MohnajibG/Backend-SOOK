import { Response } from "express";
import mongoose from "mongoose";
import Cart from "../models/Cart";
import Offer from "../models/Offer";
import { AuthenticatedRequest } from "../types/types";

// ==============================
// Ajouter un produit au panier
// ==============================
export const addCart = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { productId } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Non autorisé" });
      return;
    }

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({ message: "productId invalide ou manquant." });
      return;
    }

    // Vérifier si le produit existe dans Offer
    const product = await Offer.findById(productId);
    if (!product) {
      res.status(404).json({ message: "Produit introuvable." });
      return;
    }

    // Vérifier si déjà dans le panier
    const existingItem = await Cart.findOne({ userId, productId });
    if (existingItem) {
      res.status(400).json({ message: "Ce produit est déjà dans le panier." });
      return;
    }

    // Ajouter dans le panier avec les données de la DB
    const newItem = new Cart({
      userId,
      productId,
      name: product.title,
      price: product.price,
      quantity: 1,
    });
    await newItem.save();

    const cart = await Cart.find({ userId });
    res.status(201).json({ message: "Produit ajouté", cart });
  } catch (error) {
    console.error("🔥 Erreur addCart:", error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// ==============================
// Récupérer le panier
// ==============================
export const getCart = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ message: "Non autorisé" });
      return;
    }

    const cart = await Cart.find({ userId });
    res.status(200).json(cart);
  } catch (error) {
    console.error("🔥 Erreur getCart:", error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// ==============================
// Supprimer un produit du panier
// ==============================
export const deleteCart = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { productId } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Non autorisé" });
      return;
    }

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({ message: "productId invalide ou manquant." });
      return;
    }

    const deleted = await Cart.findOneAndDelete({ userId, productId });
    if (!deleted) {
      res.status(404).json({ message: "Produit non trouvé dans le panier." });
      return;
    }

    const cart = await Cart.find({ userId });
    res.status(200).json({ message: "Produit supprimé", cart });
  } catch (error) {
    console.error("🔥 Erreur deleteCart:", error);
    res.status(500).json({ message: (error as Error).message });
  }
};
