// src/controllers/paymentController.ts
import { Response } from "express";
import Stripe from "stripe";
import Cart from "../models/Cart";
import { AuthenticatedRequest } from "../types/types";

// ⚠️ Vérifie que STRIPE_SECRET_KEY est bien défini dans ton .env
if (!process.env.STRIPE_SECRET_KEY) {
  console.error(
    "❌ STRIPE_SECRET_KEY est manquant dans les variables d'environnement !"
  );
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// ==============================
// Créer un PaymentIntent
// ==============================
// Le montant n'est jamais accepté depuis le client : il est recalculé ici
// à partir du panier réel de l'utilisateur authentifié, pour empêcher
// toute falsification du prix côté navigateur.
export const createPaymentIntent = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ error: "Non autorisé." });
      return;
    }

    const cartItems = await Cart.find({ userId });
    if (cartItems.length === 0) {
      res.status(400).json({ error: "Le panier est vide." });
      return;
    }

    const amount = Math.round(
      cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) *
        100
    );

    if (amount <= 0) {
      res.status(400).json({ error: "Montant invalide." });
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      automatic_payment_methods: { enabled: true }, // ✅ Stripe choisira la meilleure méthode dispo
    });

    console.log("✅ PaymentIntent créé :", paymentIntent.id);

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("🔥 Erreur Stripe:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};
