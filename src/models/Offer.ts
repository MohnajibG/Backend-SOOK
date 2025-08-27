import mongoose, { Schema, Document } from "mongoose";

export interface OfferDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  condition: "Neuf" | "Très bon état" | "Bon état" | "Usé";
  city: string;
  brand: string;
  size?: string;
  color: string;
  pictures: string[];
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: {
      type: Number,
      required: true,
      min: [0, "Le prix doit être positif."],
      validate: {
        validator: (value: number) =>
          /^\d+(\.\d{1,2})?$/.test(value.toString()),
        message:
          "Le prix doit avoir au maximum deux chiffres après la virgule.",
      },
    },
    condition: {
      type: String,
      enum: ["Neuf", "Très bon état", "Bon état", "Usé"],
      required: true,
    },
    city: {
      type: String,
      required: true,
      match: [
        /^[a-zA-Z\s-]+$/,
        "La ville doit contenir uniquement des lettres.",
      ],
    },
    brand: { type: String, required: true },
    size: { type: String, required: false }, // 👈 optionnel
    color: { type: String, required: true },
    pictures: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) =>
          value.every((url) => /^https?:\/\//.test(url)),
        message: "Toutes les images doivent être des URLs valides.",
      },
    },
  },
  { timestamps: true }
);

const OfferModel = mongoose.model<OfferDocument>("Offer", OfferSchema);

export default OfferModel;
