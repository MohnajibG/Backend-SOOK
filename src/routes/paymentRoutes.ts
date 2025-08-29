import express from "express";
import { createPaymentIntent } from "../controllers/paymentController";

const router = express.Router();

// Route publique ou protégée selon ton choix
router.post("/create-payment-intent", createPaymentIntent);

export default router;
