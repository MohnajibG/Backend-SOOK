import { Request, Response, NextFunction, RequestHandler } from "express";
import Cart from "../models/Cart";

interface CartItem {
  userId: string;
  productId: string;
  name: string;
  price: number;
}

// ==============================
// Ajouter un produit au panier
// ==============================
export const addCart: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const { userId, productId, name, price }: CartItem = req.body;

    // Validation des données reçues
    if (
      !userId ||
      !productId ||
      !name ||
      typeof price !== "number" ||
      price <= 0
    ) {
      res.status(400).json({
        message: "Champs requis : userId, productId, name, price (positif).",
        body: req.body,
      });
      return;
    }

    // Vérifie si l'article existe déjà dans le panier
    const existingCartItem = await Cart.findOne({ userId, productId });
    if (existingCartItem) {
      res.status(400).json({ message: "Ce produit est déjà dans le panier." });
      return;
    }

    // Création d'un nouvel article dans le panier
    const cartItem = new Cart({
      userId,
      productId,
      name,
      price,
    });

    await cartItem.save();

    // Retourne le panier complet
    const userCart = await Cart.find({ userId });
    res.status(201).json({
      message: "Produit ajouté au panier",
      cart: userCart,
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// Récupérer le panier utilisateur
// ==============================
export const getCart: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.params.userId;

  if (!userId) {
    res.status(400).json({ message: "L'ID utilisateur est requis." });
    return;
  }

  try {
    const cart: CartItem[] = await Cart.find({ userId });
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// ==============================
// Supprimer un produit du panier
// ==============================
export const deleteCart: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, productId } = req.params;

  try {
    const result = await Cart.findOneAndDelete({ userId, productId });

    if (result) {
      const updatedCart: CartItem[] = await Cart.find({ userId });
      res
        .status(200)
        .json({ message: "Article supprimé du panier", cart: updatedCart });
    } else {
      res.status(404).json({ error: "Article non trouvé dans le panier" });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
