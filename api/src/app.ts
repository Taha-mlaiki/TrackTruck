import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import truckRoutes from "./modules/fleet/trucks/truck.routes";
import trailerRoutes from "./modules/fleet/trailers/trailer.routes";
import tiresRoutes from "./modules/fleet/tires/tire.routes";
import tripRoutes from "./modules/trips/trip.routes";
import maintenanceRoutes from "./modules/maintenance/maintenance.routes";
import fuelRoutes from "./modules/fuel/fuel.routes";
import { errorHandler } from "./errors/error.middleware";



const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ 
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"], 
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use("/api/auth", authRoutes);
app.use("/api/trailers", trailerRoutes);
app.use("/api/tires", tiresRoutes);
app.use("/api/users", userRoutes);
app.use("/api/trucks", truckRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/fuel", fuelRoutes);



app.use(errorHandler);

export default app;
