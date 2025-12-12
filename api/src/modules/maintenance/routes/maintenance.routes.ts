import { Router } from "express";
import { MaintenanceRepository } from "../repositories/MaintenanceRepository";
import { MaintenanceService } from "../services/MaintencanceService";
import { MaintenanceController } from "../controllers/MaintenanceController";
import { maintenanceRuleSchema } from "../dto/CreateMaintenanceDTO";
import { TrailerRepository } from "../../fleet/trailers/repositories/TrailerRepository";
import { TireRepository } from "../../fleet/tires/repositories/TireRepository";
import { TruckRepository } from "../../fleet/trucks/repositories/TruckRepository";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { requireRole } from "../../../middlewares/role.middleware";
import { validate } from "../../../middlewares/validation.middleware";

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
