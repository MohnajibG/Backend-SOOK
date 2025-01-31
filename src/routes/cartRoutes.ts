import express from "express";
import { addCart, getCart, deleteCart } from "../controllers/cartController";

const router = express.Router();

router.post("/cart/add", addCart);
router.get("/cart/userId", getCart);
router.delete("/cart/userId/:id", deleteCart);

export default router;
