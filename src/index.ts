import express, { Response, Request } from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/userRoutes";

const app = express();
app.use(cors());
app.use(express.json());

// Assure-toi d'utiliser un préfixe, par exemple "/user"
app.use("/user", userRoutes);

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

app.get("/", (req: Request, res: Response) => {
  res.status(200).json("Welcome to Vinted API");
});

// Pour capturer les routes non trouvées
app.all("*", (req: Request, res: Response) => {
  res.status(404).json({ message: "Route Not Found" });
});

// Lancement du serveur
app.listen(process.env.PORT, () => {
  console.log(`Server STARTED 📡 on port ${process.env.PORT}`);
});
