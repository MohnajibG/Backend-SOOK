import express from "express";
import { addCart, getCart, deleteCart } from "../controllers/cartController";

const router = express.Router();

router.post("/add", addCart);
router.get("/userId", getCart);
router.delete("/userId/:id", deleteCart);

export default router;
