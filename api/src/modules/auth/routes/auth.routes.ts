import { Router } from "express";
import { UserRepository } from "../../users/repositories/UserRepository";
import { AuthService } from "../services/AuthService";
import { AuthController } from "../controllers/AuthController";
import { validate } from "../../../middlewares/validation.middleware";
import { LoginSchema } from "../dto/loginDTO";

const router = Router();
const userRepo = new UserRepository();
const authService = new AuthService(userRepo);
const authController = new AuthController(authService);

router.post("/login", validate(LoginSchema), authController.login);
router.post("/logout", authController.logout);

export default router;
