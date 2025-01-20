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
router.post("/add", addCart);
router.delete("/delete/:id", isAuthenticated, deleteCart);
router.put("/update/:id", isAuthenticated, updateCart);

export default router;
