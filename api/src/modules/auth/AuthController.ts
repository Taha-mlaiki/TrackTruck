import { Request, Response, NextFunction } from "express";
import { AuthService } from "./AuthService";
import config from "../../config";

export class AuthController {
  constructor(private authService: AuthService) {}

  private setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
    // Access token - short lived (15 min)
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: config.COOKIE_SECURE,
      maxAge: 1000 * 60 * 15, // 15 minutes
      sameSite: "lax",
    });

    // Refresh token - long lived (7 days)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.COOKIE_SECURE,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    });
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password: pass } = req.body;
      const { accessToken, refreshToken, user } = await this.authService.login(email, pass);

      this.setTokenCookies(res, accessToken, refreshToken);

      const { password, ...safe } = (user as any).toObject();
      res.json({ user: safe });
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token" });
      }

      const { accessToken, refreshToken: newRefreshToken, user } =
        await this.authService.refreshTokens(refreshToken);

      this.setTokenCookies(res, accessToken, newRefreshToken);

      const { password, ...safe } = (user as any).toObject();
      res.json({ user: safe });
    } catch (err) {
      next(err);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.cookies?.accessToken;
      if (!accessToken) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await this.authService.getUserFromToken(accessToken);
      const { password, ...safe } = (user as any).toObject();
      res.json({ user: safe });
    } catch (err) {
      next(err);
    }
  };

  logout = async (req: Request, res: Response) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ ok: true });
  };
}
