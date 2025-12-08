import dotenv from "dotenv";
import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT || 3000;

app.get("/", (req:Request, res:Response) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});