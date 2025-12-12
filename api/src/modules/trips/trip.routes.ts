import { Router } from "express";
import { TripRepository } from "./TripRepository";
import { TripService } from "./TripService";
import { TripController } from "./TripController";
import { UserRepository } from "../users/UserRepository";
import { TruckRepository } from "../fleet/trucks/TruckRepository";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { PdfService } from "../../utils/pdf.service";
import { validate } from "../../middlewares/validation.middleware";
import { CreateTripSchema } from "./CreateTripDTO";

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
