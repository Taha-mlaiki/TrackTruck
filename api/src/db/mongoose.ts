import mongoose from "mongoose";
import config from "../config";
import logger from "../utils/logger";

export const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error("MongoDB connection error", err as any);
    throw err;
  }
};
