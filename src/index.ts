import express, { Response, Request } from "express";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";

import userRoutes from "./routes/userRoutes";
import profileRoutes from "./routes/profileRoutes";

import offerRoutes from "./routes/offerRoutes";
import fileUpload from "express-fileupload";
import cloudinary from "cloudinary";

// Configuration Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));

app.use("/user", userRoutes);
app.use("/user", profileRoutes);

app.use(offerRoutes);

io.on("connection", (socket: Socket) => {
  console.log("un utilisateur s/'est connecté");
  socket.on("message", (data: string) => {
    io.emit("message", data);
  });
  socket.on("disconnect", () => {
    console.log("un utilisateur s/'est déconnecté");
  });
});

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
    console.log("Error connecting to MongoDB 🛑:", error);
  }
};
connectMongoDB();

app.use(fileUpload());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json("Welcome to SOOOOK!!!");
});

app.all("*", (req: Request, res: Response) => {
  res.status(404).json({ message: "404, on t'a dit" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server STARTED 📡 on port ${process.env.PORT}`);
});
