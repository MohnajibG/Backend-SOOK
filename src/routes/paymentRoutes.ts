import express from "express";
import { createPaymentIntent } from "../controllers/paymentController";
import isAuthenticated from "../middlewares/isAuthenticated";

const router = express.Router();

// Route protégée : le montant est recalculé côté serveur à partir du panier.
router.post("/create-payment-intent", isAuthenticated, createPaymentIntent);

export default router;
