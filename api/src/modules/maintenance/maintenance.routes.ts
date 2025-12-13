import { Router } from "express";
import { MaintenanceRepository } from "./MaintenanceRepository";
import { MaintenanceService } from "./services/MaintenanceService";
import { MaintenanceController } from "./MaintenanceController";
import { maintenanceRuleSchema } from "./CreateMaintenanceDTO";
import { TrailerRepository } from "../fleet/trailers/TrailerRepository";
import { TireRepository } from "../fleet/tires/TireRepository";
import { TruckRepository } from "../fleet/trucks/TruckRepository";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validation.middleware";

const router = Router();
const MaintenanceRepo = new MaintenanceRepository();
const trailerRepo = new TrailerRepository();
const tireRepo = new TireRepository();
const truckRepo = new TruckRepository();
const service = new MaintenanceService(MaintenanceRepo, truckRepo, trailerRepo, tireRepo);
const controller = new MaintenanceController(service);

router.post("/", requireAuth, requireRole(["Admin"]), validate(maintenanceRuleSchema), controller.create);
router.get("/", requireAuth, controller.list);
router.get("/:id", requireAuth, controller.getOne);
router.patch("/:id", requireAuth, requireRole(["Admin"]), validate(maintenanceRuleSchema.partial()), controller.update);
router.delete("/:id", requireAuth, requireRole(["Admin"]), controller.remove);

export default router;
