import { Request, Response } from "express";
import Cart from "../models/Cart";

export const addCart = async (req: Request, res: Response) => {
  const { productId, quantity } = req.body;

  try {
    let cartItem = await Cart.findOne({ productId });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = new Cart({ productId, quantity });
      await cartItem.save();
    }

    res.status(200).json({ message: "Produit ajouté au panier", cartItem });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getCart = async (req: Request, res: Response) => {
  try {
    const cart = await Cart.find();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteCart = async (req: Request, res: Response) => {
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

export const updateCart = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity <= 0) {
    res.status(400).json({ error: "La quantité doit être supérieure à zéro." });
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
