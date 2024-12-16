import express from "express";
import {
  getOffers,
  publishOffer,
  searchOffers,
} from "../controllers/offerController";

import isAuthenticated from "../middlewares/isAuthenticated";

const router = express.Router();

router.get("/offers", getOffers);
router.get("/offers/search", searchOffers);

router.post("/offers/publish", isAuthenticated, publishOffer);

export default router;
