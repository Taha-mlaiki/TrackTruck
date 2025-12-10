import { Router } from "express";
import { UserRepository } from "../repositories/UserRepository";
import { UserService } from "../services/UserService";
import { UserController } from "../controllers/UserController";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { requireRole } from "../../../middlewares/role.middleware";
import { validate } from "../../../middlewares/validation.middleware";
import { CreateUserSchema } from "../dto/CreateUserDTO";

const router = Router();
const repo = new UserRepository();
const service = new UserService(repo);
const controller = new UserController(service);

router.post("/", requireAuth, requireRole(["Admin"]), validate(CreateUserSchema), controller.create);
router.get("/", requireAuth, requireRole(["Admin"]), controller.list);
router.get("/:id", requireAuth, controller.getOne);

export default router;