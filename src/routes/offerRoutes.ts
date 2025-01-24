import express from "express";
import {
  deleteOffer,
  getOfferById,
  getOffers,
  getMyOffers,
  publishOffer,
  searchOffers,
  updateOffer,
} from "../controllers/offerController";

import isAuthenticated from "../middlewares/isAuthenticated";

const router = express.Router();

router.get("/offers", getOffers);
router.get("/offers/search", searchOffers);
router.get("/offers/:id", getOfferById);

router.post("/offers/publish", isAuthenticated, publishOffer);

router.get("/user", isAuthenticated, getMyOffers);
router.get("/:id", getOfferById);
router.put("/update/:id", isAuthenticated, updateOffer);
router.delete("/delete/:id", isAuthenticated, deleteOffer);

export default router;
