import { NextFunction, Request, Response } from "express";
import config from "../config";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError";

export interface AuthRequest extends Request {
  user?: { id: string; role: string; email?: string };
}

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    return next(new AppError(401, "Authentication required"));
  }
  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as any;
    req.user = {
      id: String(payload.sub),
      role: payload.role,
      email: payload.email,
    };
    next();
  } catch (error) {
    return next(new AppError(401, "Invalid or expired token"));
  }
};
