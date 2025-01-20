import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated";

import {
  getCart,
  addCart,
  deleteCart,
  updateCart,
} from "../controllers/cartController";

const router = Router();

router.get("/cart", getCart);
router.post("/add", addCart);
router.delete("/delete/:id", deleteCart);
router.put("/update/:id", updateCart);

export default router;
