import express from "express";
import {
  getOfferById,
  getOffers,
  publishOffer,
  searchOffers,
} from "../controllers/offerController";

import isAuthenticated from "../middlewares/isAuthenticated";
import { get } from "http";

const router = express.Router();

router.get("/offers", getOffers);
router.get("/offers/search", searchOffers);
router.post("/offers:offerId", getOfferById);

router.post("/offers/publish", isAuthenticated, publishOffer);

export default router;
