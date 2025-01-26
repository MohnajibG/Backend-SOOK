import express from "express";
import { addCart, getCart, deleteCart } from "../controllers/cartController";

const router = express.Router();

router.post("/add", addCart);
router.get("/", getCart);
router.delete("/:id", deleteCart);

export default router;
