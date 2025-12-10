import dotenv from "dotenv";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes";
import cors from "cors";
// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use("/auth", authRoutes);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  try {
    await mongoose.connect(process.env.DATABASE_URL || "");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
  }
});
