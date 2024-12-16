import { Request, Response, NextFunction } from "express";
import User from "../models/User";

interface AuthenticatedRequest extends Request {
  user: any;
}

const isAuthenticated = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.headers.authorization) {
      res.status(401).json({ message: "Unauthorized 🤟🏻" });
      return;
    }

    const token = req.headers.authorization.replace("Bearer ", "");
    const user = await User.findOne({ token: token });

    if (!user) {
      res.status(401).json({ message: "Unauthorized🙀" });
      return;
    }

    req.user = user;
    return next();
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }
};

export default isAuthenticated;
