import express from "express";
import { getOffers, publishOffer } from "../controllers/offerControler"; // import isAuthenticated from "../middlewares/isAuthenticated";
import isAuthenticated from "../middlewares/isAuthenticated";

const router = express.Router();

router.post("/offers/publish", isAuthenticated, publishOffer);

router.get("/offers", getOffers);
export default router;
