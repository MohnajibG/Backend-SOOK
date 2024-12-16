import express from "express";
import {
  getOffers,
  publishOffer,
  searchOffers,
} from "../controllers/offerControler";

import isAuthenticated from "../middlewares/isAuthenticated";

const router = express.Router();

router.post("/offers/publish", isAuthenticated, publishOffer);

router.get("/offers", getOffers);

router.get("/offers/search", searchOffers);

export default router;
