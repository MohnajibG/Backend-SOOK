// src/controllers/paymentController.ts
import { Request, Response } from "express";
import Stripe from "stripe";

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
export const createPaymentIntent = async (req: Request, res: Response) => {
  const { amount } = req.body; // ⚠️ montant attendu en CENTIMES (ex: 1000 = 10€)

  console.log("💳 Requête de paiement reçue avec amount:", amount);

  if (!amount || isNaN(amount)) {
    res
      .status(400)
      .json({ error: "Le montant est requis et doit être un nombre valide." });
    return;
  }

  try {
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
