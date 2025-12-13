import dotenv from "dotenv";
dotenv.config();

export default {
  PORT: process.env.PORT ? Number(process.env.PORT) : 5001,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/TrackTruck",
  JWT_SECRET: process.env.JWT_SECRET || "change_me",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "refresh_change_me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  COOKIE_SECURE: process.env.COOKIE_SECURE === "true",
  NODE_ENV: process.env.NODE_ENV || "development",
  SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL || "admin@example.com",
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD || "Admin123!",
};
