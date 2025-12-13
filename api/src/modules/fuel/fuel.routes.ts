import { Router } from "express";
import { FuelController } from "./FuelController";
import { FuelService } from "./FuelService";
import { FuelRepository } from "./FuelRepository";
import { TruckRepository } from "../fleet/trucks/TruckRepository";
import { requireAuth } from "../../middlewares/auth.middleware";
import { createFuelSchema, updateFuelSchema } from "./CreateFuelDTO";
import { validate } from "../../middlewares/validation.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = Router();

const fuelRepo = new FuelRepository();
const truckRepo = new TruckRepository();
const service = new FuelService(fuelRepo, truckRepo);
const controller = new FuelController(service);

// All routes require authentication
router.use(requireAuth);

// Get fuel stats (Admin only)
router.get("/stats", requireRole(["Admin"]), controller.getStats);

// Get fuel records by truck (Admin only)
router.get("/truck/:truckId", requireRole(["Admin"]), controller.getByTruck);

// CRUD operations
router.post("/", validate(createFuelSchema), controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getById);
router.put("/:id", validate(updateFuelSchema), controller.update);
router.delete("/:id", controller.delete);

export default router;
