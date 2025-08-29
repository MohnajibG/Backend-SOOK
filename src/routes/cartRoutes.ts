import express from "express";
import { addCart, getCart, deleteCart } from "../controllers/cartController";
import isAuthenticated from "../middlewares/isAuthenticated";

const router = express.Router();

// Ajouter un produit au panier (auth obligatoire)
router.post("/cart/add", isAuthenticated, addCart);

// Récupérer le panier de l'utilisateur connecté
router.get("/cart", isAuthenticated, getCart);

// Supprimer un produit du panier de l'utilisateur connecté
router.delete("/cart/:productId", isAuthenticated, deleteCart);

export default router;
