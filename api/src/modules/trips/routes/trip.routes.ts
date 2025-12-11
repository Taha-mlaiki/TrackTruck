import { Router } from "express";
import { TripRepository } from "../repositories/TripRepository";
import { TripService } from "../services/TripService";
import { TripController } from "../controllers/TripController";
import { UserRepository } from "../../users/repositories/UserRepository";
import { TruckRepository } from "../../fleet/trucks/repositories/TruckRepository";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { requireRole } from "../../../middlewares/role.middleware";
import { PdfService } from "../../../utils/pdf.service";
import { validate } from "../../../middlewares/validation.middleware";
import { CreateTripSchema } from "../dto/CreateTripDTO";

const router = Router();
const tripRepo = new TripRepository();
const userRepo = new UserRepository();
const truckRepo = new TruckRepository();
const pdfService = new PdfService();
const tripService = new TripService(tripRepo, userRepo, truckRepo, pdfService);
const tripController = new TripController(tripService);

router.post("/", requireAuth, requireRole(["Admin"]), validate(CreateTripSchema), tripController.create);
router.get("/", requireAuth, tripController.list);
router.post("/:id/status", requireAuth, requireRole(["Driver", "Admin"]), tripController.updateStatus);
router.get("/:id/pdf", requireAuth, requireRole(["Driver", "Admin"]), tripController.downloadPdf);

export default router;
        