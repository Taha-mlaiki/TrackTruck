import mongoose from "mongoose";
import config from "../config";

export const connectDB = async () => {
  await mongoose.connect(config.MONGO_URI);
  console.log("MongoDB connected");
};
