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
router.get("/offers/user", isAuthenticated, getMyOffers);
router.put("/offers/update/:id", isAuthenticated, updateOffer);
router.delete("/offers/delete/:id", isAuthenticated, deleteOffer);

export default router;
