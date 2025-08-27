import { Request, Response } from "express";
import Cart from "../models/Cart";

// ==============================
// Ajouter un produit au panier
// ==============================
export const addCart = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("BODY reçu :", req.body);

    const { userId, productId, name, price } = req.body;
    const parsedPrice = Number(price);

    if (
      !userId ||
      !productId ||
      !name ||
      isNaN(parsedPrice) ||
      parsedPrice <= 0
    ) {
      res.status(400).json({
        message: "Champs requis : userId, productId, name, price (positif).",
        body: req.body,
      });
      return;
    }

    const existingItem = await Cart.findOne({ userId, productId });
    if (existingItem) {
      res.status(400).json({ message: "Ce produit est déjà dans le panier." });
      return;
    }

    const newItem = new Cart({ userId, productId, name, price: parsedPrice });
    await newItem.save();

    const cart = await Cart.find({ userId });
    res.status(201).json({ message: "Produit ajouté", cart });
  } catch (error) {
    console.error("Erreur addCart:", error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// ==============================
// Récupérer le panier
// ==============================
export const getCart = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  if (!userId) {
    res.status(400).json({ message: "userId manquant." });
    return;
  }

  try {
    const cart = await Cart.find({ userId });
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// ==============================
// Supprimer un produit du panier
// ==============================
export const deleteCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, productId } = req.params;

  if (!userId || !productId) {
    res.status(400).json({ message: "userId et productId requis." });
    return;
  }

  try {
    const deleted = await Cart.findOneAndDelete({ userId, productId });
    if (!deleted) {
      res.status(404).json({ message: "Produit non trouvé." });
      return;
    }

    const cart = await Cart.find({ userId });
    res.status(200).json({ message: "Produit supprimé", cart });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
