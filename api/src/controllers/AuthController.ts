import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    try {
      const user = await this.userService.findUserByEmail(email);
      if (!user) {
        throw new Error("User not found");
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error("Invalid password");
      }
      const token = jwt.sign({ id: user._id, role: user.role }, "secret", {
        expiresIn: "1h",
      });
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        expires: new Date(Date.now() + 60 * 60 * 1000),
      });
      res.json({ message: "Logged in successfully" });
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  async register(req: Request, res: Response) {
    const { full_name, email, password, phone, role } = req.body;
    try {
      const user = await this.userService.createUser({
        full_name,
        email,
        password,
        phone,
        role,
      });
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}
