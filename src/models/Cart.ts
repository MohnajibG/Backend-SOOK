import mongoose, { Schema } from "mongoose";

interface Cart {
  userId: mongoose.Types.ObjectId;
  id: string;
  name: string;
  price: number;
}
interface CartDocument extends Cart, Document {}

const CartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", require: true },
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

const CartModel = mongoose.model<CartDocument>("Cart", CartSchema);
export default CartModel;
