import { Request, Response, NextFunction } from "express";
import { AppError } from "./AppError";
import logger from "../utils/logger";
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(`AppError: ${err.message}`, { status: err.status, details: err.details });
    return res.status(err.status).json({ error: err.message, details: err.details ?? null });
  }
  logger.error("UnhandledError", { error: err });
  return res.status(500).json({ error: "Internal Server Error" });
};
