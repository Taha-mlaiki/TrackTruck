import { Request, Response, NextFunction } from "express";
import { AppError } from "./AppError";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res
      .status(err.status)
      .json({ message: err.message, details: err.details ?? null });
  }
  console.error(err);
  return res.status(500).json({ error: "Internal Server Error" });
};
