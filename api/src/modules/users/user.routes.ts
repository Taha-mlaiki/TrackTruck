import { Router } from "express";
import { UserRepository } from "./UserRepository";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { CreateUserSchema } from "./CreateUserDTO";
import { UserService } from "./UserService";
import { UserController } from "./UserController";

const router = Router();
const repo = new UserRepository();
const service = new UserService(repo);
const controller = new UserController(service);

router.post("/", requireAuth, requireRole(["Admin"]), validate(CreateUserSchema), controller.create);
router.get("/", requireAuth, requireRole(["Admin"]), controller.list);
router.get("/:id", requireAuth, controller.getOne);

export default router;