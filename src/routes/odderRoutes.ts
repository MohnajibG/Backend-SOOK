import express from "express";
import fileUpload from "express-fileupload";
import isAuthenticated from "../middlewares/isAuthenticated";

const router = express.Router();

router.post(
  "/offers/publish",
  fileUpload(),
  isAuthenticated,
  async (req, res) => {
    try {
      // Le contrôleur sera implémenté ici
      res.status(200).json({ message: "Route accessible." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
