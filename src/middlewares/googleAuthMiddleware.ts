import { Request, Response, NextFunction } from "express";

export const googleAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(403).send("User not authenticated");
};
