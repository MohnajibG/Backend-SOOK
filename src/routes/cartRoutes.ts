import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated";

import { getCart, addCart } from "../controllers/cartController";

const router = Router();

router.get("/cart", isAuthenticated, getCart);
router.post("/cart/add", isAuthenticated, addCart);

export default router;
