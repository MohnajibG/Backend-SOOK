import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated";

import {
  getCart,
  addCart,
  deleteCart,
  updateCart,
} from "../controllers/cartController";

const router = Router();

router.get("/cart", isAuthenticated, getCart);
router.post("/cart/add", isAuthenticated, addCart);
router.delete("/cart/delete/:id", isAuthenticated, deleteCart);
router.put("/cart/update/:id", isAuthenticated, updateCart);

export default router;
