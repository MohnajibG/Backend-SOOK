import mongoose, { Schema, Document } from "mongoose";

interface Cart {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const CartSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { timestamps: true }
);
const CartModel = mongoose.model<Cart>("Cart", CartSchema);
export default CartModel;
