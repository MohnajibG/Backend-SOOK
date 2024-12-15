import { Response, Request, NextFunction } from "express";
import cloudinary from "cloudinary";
import Offer from "../models/Offer";
import { log } from "console";

export const publishOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const {
    userId,
    title,
    discription,
    price,
    condition,
    city,
    brand,
    size,
    color,
  } = req.body;
  if (
    !userId ||
    !title ||
    !discription ||
    !price ||
    !condition ||
    !city ||
    !brand ||
    !size
  ) {
    res.status(400).json({ message: "Tous les champs sont requis." });
    return;
  }
  try {
    const pictureUrls: string[] = [];

    if (req.files && req.files.pictures) {
      const files = req.files.pictures;
      if (Array.isArray(files)) {
        const uploadPromises = files.map((file) => {
          cloudinary.v2.uploader.upload(file.tempFilePath);
        });
        const results = await Promise.all(uploadPromises);
        pictureUrls.push(...results.map((result) => result.secure_url));

        console.log("toutes les images ont ete upload", pictureUrls);
      } else {
        const result = await cloudinary.v2.uploader.upload(files.tempFilePath);
        pictureUrls.push(result.secure_url);
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Error lors de l'upload des images" });
    await newOffer.save();
  }
};
