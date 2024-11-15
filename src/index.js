"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
// Importe tes routes ici
const user_1 = __importDefault(require("./routes/user"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
require("dotenv").config();
const connectMongoDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!process.env.MONGODB_URI) {
            console.log("MONGODB_URI is not defined in the environment variables");
            return;
        }
        yield mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB ✅");
    }
    catch (error) {
        console.error("Error connecting to MongoDB 🛑:", error);
    }
});
connectMongoDB();
// Utilise tes routes ici, avant la capture de toutes les requêtes
app.use(user_1.default);
app.get("/", (request, response) => {
    response.status(200).send("Hello World");
});
// Pour capturer toutes les routes non trouvées
app.all("*", (req, res) => {
    res.status(404).json({ message: "Not Found Vinted TS" });
});
app.listen(process.env.PORT, () => {
    console.log(`Server STARTED 📡 on port ${process.env.PORT}`);
});
