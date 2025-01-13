import { Response } from "express";

import { AuthenticatedRequest } from "../types/types";

import Cart from "../models/Cart";

export const addCart = async (req: AuthenticatedRequest, res: Response) => {
  const { userId, prodeuctId, quantity } = req.body;
  try {
    const cartItem = await Cart.findOne();
    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      const newCartItem = new Cart({
        userId,
        prodeuctId,
        quantity,
      });
      await newCartItem.save();
    }
    res.status(200).json({ message: "produit ajouter dans le panier " });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cart = await Cart.find();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteCart = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const result = await Cart.findOneAndDelete({ id });

    if (result) {
      res.status(200).json({ message: "Article supprimé du panier" });
    } else {
      res.status(404).json({ error: "Article non trouvé dans le panier" });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateCart = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity <= 0) {
    res.status(400).json({ error: "La quantité doit être supérieure à zéro." });
  }

  try {
    // Mettre à jour la quantité de l'article
    const updatedItem = await Cart.findOneAndUpdate(
      { id },
      { $set: { quantity } },
      { new: true }
    );

    if (updatedItem) {
      res.status(200).json({ message: "Quantité mise à jour", updatedItem });
    } else {
      res.status(404).json({ error: "Article non trouvé dans le panier" });
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'article :", error);
    res.status(500).json({ error: "Erreur serveur lors de la mise à jour" });
  }
};
