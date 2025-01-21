import express from "express";
import {
  addCart,
  getCart,
  deleteCart,
  updateCart,
} from "../controllers/cartController";

const router = express.Router();

router.post("/add", addCart);
router.get("/", getCart);
router.delete("/:id", deleteCart);
router.put("/:id", updateCart);

export default router;
