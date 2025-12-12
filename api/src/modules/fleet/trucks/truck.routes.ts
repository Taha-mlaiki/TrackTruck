import { Router } from "express";
import { TruckRepository } from "./TruckRepository";
import { TruckService } from "./TruckService";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { requireRole } from "../../../middlewares/role.middleware";
import { validate } from "../../../middlewares/validation.middleware";
import { createTruckSchema, updateTruckSchema } from "../validationSchemas";
import { TruckController } from "./TruckController";

const router = Router();

const repo = new TruckRepository();
const service = new TruckService(repo);
const controller = new TruckController(service);

router.post(
  "/",
  requireAuth,
  requireRole(["Admin"]),
  validate(createTruckSchema),
  controller.create
);
router.get("/", requireAuth, controller.list);
router.get("/:id", requireAuth, controller.getOne);
router.patch(
  "/:id",
  requireAuth,
  requireRole(["Admin"]),
  validate(updateTruckSchema),
  controller.update
);
router.delete("/:id", requireAuth, requireRole(["Admin"]), controller.remove);

export default router;
