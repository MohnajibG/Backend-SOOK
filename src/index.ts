import dotenv from "dotenv";
dotenv.config();

import express, { Response, Request } from "express";

import connectMongoDB from "./config/db";

import cors from "cors";

import userRoutes from "./routes/userRoutes";
import profileRoutes from "./routes/profileRoutes";

import offerRoutes from "./routes/offerRoutes";
import cartRoutes from "./routes/cartRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import googleAuthRouter from "./routes/googleAuth";

const app = express();

app.use(cors({ origin: "*" }));

app.use(express.json());

app.use("/user", userRoutes);
app.use("/user", profileRoutes);
app.use("/cart", cartRoutes);
app.use("/payment", paymentRoutes);

app.use("/user", googleAuthRouter);

app.use(offerRoutes);

connectMongoDB();

app.get("/", (req: Request, res: Response) => {
  res.status(200).json("Welcome to SOOOOK!!!");
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "404, on t'a dit" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server STARTED 📡 on port ${process.env.PORT}`);
});
