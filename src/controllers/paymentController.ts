import { Request, Response } from "express";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// ==============================
// Créer un PaymentIntent
// ==============================
export const createPaymentIntent = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { amount } = req.body; // ⚠️ montant attendu en CENTIMES (par ex. 1000 = 10€)

  if (!amount || isNaN(amount)) {
    res.status(400).json({ error: "Montant invalide ou manquant" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("🔥 Erreur Stripe createPaymentIntent:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};
