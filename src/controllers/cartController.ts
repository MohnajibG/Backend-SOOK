import { Response } from "express";
import { AuthenticatedRequest } from "../types/types";
import Cart from "../models/Cart";

export const addCart = async (req: AuthenticatedRequest, res: Response) => {
  const { userId, productId, quantity } = req.body;

  try {
    let cartItem = await Cart.findOne({ userId, productId });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = new Cart({ userId, productId, quantity });
      await cartItem.save();
    }

    res.status(200).json({ message: "Produit ajouté au panier", cartItem });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Utilisateur non identifié" });
    }

    const cart = await Cart.find({ userId });
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteCart = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const result = await Cart.findByIdAndDelete(id);

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
    return res
      .status(400)
      .json({ error: "La quantité doit être supérieure à zéro." });
  }

  try {
    const updatedItem = await Cart.findByIdAndUpdate(
      id,
      { quantity },
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
