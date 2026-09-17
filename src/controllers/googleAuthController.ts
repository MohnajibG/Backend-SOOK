import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import uid2 from "uid2";
import User, { UserDocument } from "../models/User";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
      audience: process.env.GOOGLE_CLIENT_ID,
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
    }

    // Token d'authentification opaque, cohérent avec le login classique :
    // c'est ce token que `isAuthenticated` recherche en base pour chaque
    // requête sur les routes protégées.
    user.token = uid2(32);
    await user.save();

    res.status(200).json({
      userId: user._id,
      token: user.token,
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
