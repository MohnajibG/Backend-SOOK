import mongoose, { Schema, Document } from "mongoose";

interface Offer extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  condition: string;
  city: string;
  brand: string;
  size: string;
  color: string;
  pictures: string[];
  createdAt: Date;
}

const OfferSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: {
      type: Number,
      required: true,
      min: [0, "Le prix doit être positif."],
      validate: {
        validator: function (value: number) {
          return /^\d+(\.\d{1,2})?$/.test(value.toString());
        },
        message:
          "Le prix doit être un nombre avec au maximum deux chiffres après la virgule.",
      },
    },
    condition: { type: String, required: true },
    city: {
      type: String,
      required: true,
      match: [
        /^[a-zA-Z\s-]+$/,
        "La ville doit contenir uniquement des lettres.",
      ],
    },
    brand: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    pictures: {
      type: [String],
      required: true,
      validate: {
        validator: function (value: string[]) {
          return value.every((url) =>
            /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/.test(url)
          );
        },
        message: "Toutes les images doivent être des URLs valides.",
      },
      createdAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

const OfferModel = mongoose.model<Offer>("Offer", OfferSchema);

export default OfferModel;
