import { Router } from "express";
import { TrailerRepository } from "./TrailerRepository";
import { TrailerService } from "./TrailerService";
import { TrailerController } from "./TrailerController";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { requireRole } from "../../../middlewares/role.middleware";
import { validate } from "../../../middlewares/validation.middleware";
import { createTrailerSchema, updateTrailerSchema } from "../validationSchemas";

const router = Router();
const repo = new TrailerRepository();
const service = new TrailerService(repo);
const controller = new TrailerController(service);

router.post(
  "/",
  requireAuth,
  requireRole(["Admin"]),
  validate(createTrailerSchema),
  controller.create
);
router.get("/", requireAuth, controller.list);
router.get("/:id", requireAuth, controller.getOne);
router.patch(
  "/:id",
  requireAuth,
  requireRole(["Admin"]),
  validate(updateTrailerSchema),
  controller.update
);
router.delete("/:id", requireAuth, requireRole(["Admin"]), controller.remove);

export default router;
