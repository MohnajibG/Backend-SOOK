import mongoose, { Schema, Document } from "mongoose";

export interface Cart {
  userId: mongoose.Types.ObjectId;
  productId: string;
  name: string;
  price: number;
}

export interface CartDocument extends Cart, Document {}

const CartSchema = new Schema<CartDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

const CartModel = mongoose.model<CartDocument>("Cart", CartSchema);
export default CartModel;
