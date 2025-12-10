import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService";
import config from "../../../config";

export class AuthController {
  constructor(private authService: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password:pass } = req.body;
      const { token, user } = await this.authService.login(email, pass);
      res.cookie("token", token, {
        httpOnly: true,
        secure: config.COOKIE_SECURE,
        maxAge: 1000 * 60 * 60, // 1h
        sameSite: "strict",
      });
      const { password, ...safe } = (user as any).toObject();
      res.json({ user: safe });
    } catch (err) {
      next(err);
    }
  };

  logout = async (req: Request, res: Response) => {
    res.clearCookie("token");
    res.json({ ok: true });
  };
}
