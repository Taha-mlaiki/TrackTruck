import { Router } from "express";
import { UserRepository } from "../users/UserRepository";
import { validate } from "../../middlewares/validation.middleware";
import { LoginSchema } from "./loginDTO";
import { AuthService } from "./AuthService";
import { AuthController } from "./AuthController";

const router = Router();
const userRepo = new UserRepository();
const authService = new AuthService(userRepo);
const authController = new AuthController(authService);

router.post("/login", validate(LoginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.get("/me", authController.me);
router.post("/logout", authController.logout);

export default router;
