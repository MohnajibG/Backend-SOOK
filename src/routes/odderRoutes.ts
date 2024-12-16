import express from "express";
import {
  getOffers,
  publishOffer,
  searchOffers,
} from "../controllers/offerController";

import isAuthenticated from "../middlewares/isAuthenticated";

const router = express.Router();

router.post("/offers/publish", publishOffer);

router.get("/offers", getOffers);

router.get("/offers/search", searchOffers);

export default router;
