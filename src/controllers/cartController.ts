import { Request, Response, NextFunction, RequestHandler } from "express";

import Cart from "../models/Cart";

interface CartItem {
  id: string;
  name: string;
  price: number;
}

// Ajout d'un article au panier
export const addCart: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, name, price }: CartItem = req.body;
    // Extraction et typage des données envoyées dans le corps de la requête.

    if (!id || !name || price === undefined) {
      // Vérifie si toutes les données requises sont présentes.
      res
        .status(400)
        .json({ message: "Tous les champs sont requis (id, name, price)." });
    }

    const existingCartItem = await Cart.findOne({ id });
    // Recherche dans la base si un produit avec le même id est déjà dans le panier.

    if (existingCartItem) {
      // Si l'article existe déjà dans le panier, on empêche d'ajouter un doublon.
      res.status(400).json({ message: "Ce produit est déjà dans le panier." });
    }

    const cartItem = new Cart({ id, name, price });
    // Création d'un nouvel objet Cart avec les informations reçues.
    await cartItem.save();
    // Sauvegarde du nouvel article dans la base de données.

    res.status(201).json({ message: "Produit ajouté au panier", cartItem });
    // Retourne une réponse 201 (Created) avec le produit ajouté.
  } catch (error) {
    next(error);
    // Passe l'erreur au middleware de gestion des erreurs Express.
  }
};

// Récupération de tous les articles du panier
export const getCart: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cart: CartItem[] = await Cart.find();
    // Recherche de tous les articles présents dans la base de données (panier).

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
  const { id } = req.params;
  // Récupération de l'id de l'article à supprimer depuis les paramètres de l'URL.

  try {
    const result = await Cart.findOneAndDelete({ id });
    // Recherche et suppression de l'article correspondant dans la base de données.

    if (result) {
      // Si l'article a bien été trouvé et supprimé :
      const updatedCart: CartItem[] = await Cart.find();
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
