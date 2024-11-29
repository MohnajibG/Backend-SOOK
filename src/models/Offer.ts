import mongoose, { Document, Schema } from "mongoose";

// Définition des propriétés de l'offre
export interface OfferProps extends Document {
  product_name: string;
  product_description: string;
  product_price: number;
  product_details: Array<{ key: string; value: string | number }>; // Typage précis des détails
  product_image?: Record<string, unknown>;
  product_date?: Date;
  owner: mongoose.Types.ObjectId;
}

// Schéma de l'offre
const OfferSchema = new Schema<OfferProps>({
  product_name: { type: String, required: true },
  product_description: { type: String, required: true },
  product_price: { type: Number, required: true },
  product_details: {
    type: [{ key: String, value: Schema.Types.Mixed }], // Définit un tableau d'objets avec des clés et valeurs typées
    default: [],
  },
  product_image: { type: Schema.Types.Mixed, default: {} },
  product_date: { type: Date, default: Date.now },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

// Création du modèle
const Offer = mongoose.model<OfferProps>("Offer", OfferSchema);

export default Offer; // Export du modèle
