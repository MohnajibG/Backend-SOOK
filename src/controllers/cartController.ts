import { Request, Response, NextFunction, RequestHandler } from "express";

import Cart from "../models/Cart";

interface CartItem {
  userId: string;
  id: string;
  name: string;
  price: number;
}

export const addCart: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const { userId, id, name, price }: CartItem = req.body;

    // Validation des données reçues
    if (!userId || !id || !name || typeof price !== "number" || price <= 0) {
      res.status(400).json({
        message:
          "Tous les champs sont requis (userId, id, name, price). Le prix doit être un nombre positif.",
      });
      return;
    }

    // Vérifie si l'article existe déjà dans le panier pour l'utilisateur
    const existingCartItem = await Cart.findOne({ userId, id });

    if (existingCartItem) {
      // Si l'article existe déjà dans le panier, on empêche d'ajouter un doublon.
      res.status(400).json({ message: "Ce produit est déjà dans le panier." });
      return;
    }

    // Création d'un nouvel article dans le panier
    const cartItem = new Cart({
      userId,
      id,
      name,
      price,
    });

    // Sauvegarde du nouvel article dans la base de données
    await cartItem.save();

    // Retourne une réponse avec le panier mis à jour
    const userCart = await Cart.find({ userId }); // Récupère tous les articles du panier de l'utilisateur
    res.status(201).json({
      message: "Produit ajouté au panier",
      cart: userCart, // Retourne le panier complet après ajout
    });
  } catch (error) {
    next(error); // Passe l'erreur au middleware de gestion des erreurs
  }
};

// Récupération de tous les articles du panier
export const getCart: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.params.userId;

  if (!userId)
    res.status(400).json({ message: "L' ID de l'utilisateur est requis." });
  try {
    const cart: CartItem[] = await Cart.find({ userId });
    // Recherche de tous les articles présents dans la base de données (panier).
    if (cart.length === 0) {
      res.status(404).json({ message: "Aucun produit trouvé dans le panier." });
      return;
    }

    res.status(200).json(cart);
    // Retourne une réponse 200 (OK) avec la liste des articles.
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    // En cas d'erreur serveur, retourne une réponse 500 avec le message d'erreur.
  }
};

// Suppression d'un article du panier
export const deleteCart: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, id } = req.params;
  // Récupération de l'id de l'article à supprimer depuis les paramètres de l'URL.

  try {
    const result = await Cart.findOneAndDelete({ userId, id });
    // Recherche et suppression de l'article correspondant dans la base de données.

    if (result) {
      // Si l'article a bien été trouvé et supprimé :
      const updatedCart: CartItem[] = await Cart.find({ userId });
      // On récupère la liste mise à jour du panier après suppression.

      res
        .status(200)
        .json({ message: "Article supprimé du panier", cart: updatedCart });
      // Répond avec un message de succès et le panier mis à jour.
    } else {
      res.status(404).json({ error: "Article non trouvé dans le panier" });
      // Si l'article n'est pas trouvé, retourne une erreur 404 (Not Found).
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    // En cas d'erreur serveur, retourne une réponse 500 avec le message d'erreur.
  }
};
