import express, { Response, Request } from "express";
import mongoose from "mongoose";
import cors from "cors";

// Importe tes routes ici
import userRoutes from "./routes/user";

const app = express();
app.use(cors());
app.use(express.json());

require("dotenv").config();

const connectMongoDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log("MONGODB_URI is not defined in the environment variables");
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB ✅");
  } catch (error) {
    console.error("Error connecting to MongoDB 🛑:", error);
  }
};
connectMongoDB();

// Utilise tes routes ici, avant la capture de toutes les requêtes
app.use(userRoutes);
app.get("/", (req: Request, res: Response) => {
  res.status(200).json("Bienvenu dans Vinted TS de MNG");
});

// Pour capturer toutes les routes non trouvées
app.all("*", (req: Request, res: Response) => {
  res.status(404).json({ message: "Not Found Vinted TS" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server STARTED 📡 on port ${process.env.PORT}`);
});
