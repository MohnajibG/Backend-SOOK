import express, { Response, Request } from "express";
import mongoose from "mongoose";
import cors from "cors";

// Importe tes routes ici
import userRoutes from "./routes/user";

const app = express();
app.use(express.json());
app.use(cors());

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
app.get("/", (request: Request, response: Response) => {
  response.status(200).send("Hello World");
});

// Pour capturer toutes les routes non trouvées
app.all("*", (req: Request, res: Response) => {
  res.status(404).json({ message: "Not Found Vinted TS" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server STARTED 📡 on port ${process.env.PORT}`);
});
