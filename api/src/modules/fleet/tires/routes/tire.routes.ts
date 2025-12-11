import { Router } from "express";
import { TireRepository } from "../repositories/TireRepository";
import { TireService } from "../services/TireService";
import { TireController } from "../controllers/TireController";
import { requireAuth } from "../../../../middlewares/auth.middleware";
import { requireRole } from "../../../../middlewares/role.middleware";
import { validate } from "../../../../middlewares/validation.middleware";
import { createTireSchema, updateTireSchema } from "../../validationSchemas";

const router = Router();
const repo = new TireRepository();
const service = new TireService(repo);
const controller = new TireController(service);

router.post(
  "/",
  requireAuth,
  requireRole(["Admin"]),
  validate(createTireSchema),
  controller.create
);
router.get("/", requireAuth, controller.list);
router.get("/:id", requireAuth, controller.getOne);
router.patch(
  "/:id",
  requireAuth,
  requireRole(["Admin"]),
  validate(updateTireSchema),
  controller.update
);
router.delete("/:id", requireAuth, requireRole(["Admin"]), controller.remove);

export default router;
