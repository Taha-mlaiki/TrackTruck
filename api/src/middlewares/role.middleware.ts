import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "./auth.middleware";
import { AppError } from "../errors/AppError";

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !roles.includes(userRole)) {
      return next(new AppError(403, "Forbidden"));
    }
    next();
  };
};
