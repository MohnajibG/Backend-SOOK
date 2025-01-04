import { Request, Response } from "express";
import Cart from "../models/Cart";

export const addCart = async (req: Request, res: Response) => {
  const { userId, prodeuctId, quantity } = req.body;
  try {
    const cartItem = await Cart.findOne();
    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      const newCartItem = new Cart({
        userId,
        prodeuctId,
        quantity,
      });
      await newCartItem.save();
    }
    res.status(200).json({ message: "produit ajouter dans le panier " });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCart = async (req: Request, res: Response) => {
  try {
    const cart = await Cart.find();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
