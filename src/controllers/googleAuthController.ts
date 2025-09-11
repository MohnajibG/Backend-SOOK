import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import User, { UserDocument } from "../models/User";
import jwt from "jsonwebtoken";

const client = new OAuth2Client("sook-443123");

export const googleLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.body as { token: string };

    if (!token) {
      res.status(400).json({ message: "Token requis" });
      return;
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "sook-443123",
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      res.status(400).json({ message: "Token invalide" });
      return;
    }

    let user: UserDocument | null = await User.findOne({
      email: payload.email,
    });

    if (!user) {
      user = new User({
        email: payload.email,
        account: {
          username: payload.name || "Utilisateur",
          avatar: payload.picture || null,
          sexe: "Autre",
          address: null,
          phoneNumber: null,
          dateOfBorn: null,
        },
        newsletter: false,
        hash: "",
        salt: "",
      });

      await user.save();
    }

    const appToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      userId: user._id,
      token: appToken,
      account: {
        username: user.account.username,
        sexe: user.account.sexe || null,
        address: user.account.address || null,
        phoneNumber: user.account.phoneNumber || null,
      },
    });
  } catch (err) {
    console.error("🔥 Erreur googleLogin:", err);
    res.status(401).json({ message: "Erreur lors du login Google" });
  }
};
