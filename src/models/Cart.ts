import mongoose, { Schema } from "mongoose";

interface Cart {
  id: string;
  name: string;
  price: number;
}
interface CartDocument extends Cart, Document {}

const CartSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

const CartModel = mongoose.model<CartDocument>("Cart", CartSchema);
export default CartModel;
