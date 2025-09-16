import express from "express";
import {
  deleteOffer,
  getOfferById,
  getOffers,
  getMyOffers,
  getOfferByUserId,
  publishOffer,
  searchOffers,
  updateOffer,
} from "../controllers/offerController";
import isAuthenticated from "../middlewares/isAuthenticated";

const router = express.Router();

// Routes publiques
router.get("/offers", getOffers);
router.get("/offers/search", searchOffers);
router.get("/offers/user", isAuthenticated, getMyOffers);
router.get("/offers/user/:userId", getOfferByUserId);
router.get("/offers/:id", getOfferById);

// Routes protégées
router.post("/offers/publish", isAuthenticated, publishOffer);
router.put("/offers/update/:id", isAuthenticated, updateOffer);
router.delete("/offers/delete/:id", isAuthenticated, deleteOffer);

export default router;
