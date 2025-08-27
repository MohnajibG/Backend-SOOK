// src/routes/cartRoutes.ts
import express from "express";
import { addCart, getCart, deleteCart } from "../controllers/cartController";

const router = express.Router();

// Ajouter un produit au panier
router.post("/cart/add", addCart);

// Récupérer le panier d'un utilisateur
router.get("/cart/:userId", getCart);

// Supprimer un produit du panier
router.delete("/cart/:userId/:itemId", deleteCart);

export default router;
