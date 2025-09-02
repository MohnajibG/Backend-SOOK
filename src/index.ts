import dotenv from "dotenv";
dotenv.config();

import express, { Response, Request } from "express";

import connectMongoDB from "./config/db";

import cors from "cors";

import userRoutes from "./routes/userRoutes";
import profileRoutes from "./routes/profileRoutes";

import offerRoutes from "./routes/offerRoutes";
import fileUpload from "express-fileupload";
import cloudinary from "cloudinary";
import passport from "passport";
import cartRoutes from "./routes/cartRoutes";
import paymentRoutes from "./routes/paymentRoutes";

require("dotenv").config();

// Configuration Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const app = express();

app.use(cors({ origin: "*" }));

app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));
app.use(passport.initialize());

app.use("/user", userRoutes);
app.use("/user", profileRoutes);
app.use("/", cartRoutes);
app.use("/payment", paymentRoutes);

// app.use("/auth", googleAuthRoutes);

app.use(offerRoutes);

connectMongoDB();

app.get("/", (req: Request, res: Response) => {
  res.status(200).json("Welcome to SOOOOK!!!");
});

app.all("*", (req: Request, res: Response) => {
  res.status(404).json({ message: "404, on t'a dit" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server STARTED 📡 on port ${process.env.PORT}`);
});
