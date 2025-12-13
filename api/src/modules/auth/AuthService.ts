import jwt from "jsonwebtoken";
import { IUserRepository } from "../users/IUserRepository";
import { NotFoundError } from "../../errors/NotFoundError";
import { comparPwd } from "../../utils/password.util";
import { AppError } from "../../errors/AppError";
import config from "../../config";

export class AuthService {
  constructor(private userRepo: IUserRepository) {}

  generateTokens(user: { id: string; role: string; email: string }) {
    const payload = { sub: user.id, role: user.role, email: user.email };

    const accessToken = jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new NotFoundError("User not found");
    const ok = await comparPwd(password, user.password);
    if (!ok) throw new AppError(401, "Invalid credentials");

    const tokens = this.generateTokens({
      id: user.id,
      role: user.role,
      email: user.email,
    });

    return { ...tokens, user };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as {
        sub: string;
        role: string;
        email: string;
      };

      const user = await this.userRepo.findById(payload.sub);
      if (!user) throw new AppError(401, "User not found");

      const tokens = this.generateTokens({
        id: user.id,
        role: user.role,
        email: user.email,
      });

      return { ...tokens, user };
    } catch (error) {
      throw new AppError(401, "Invalid refresh token");
    }
  }

  async getUserFromToken(accessToken: string) {
    try {
      const payload = jwt.verify(accessToken, config.JWT_SECRET) as {
        sub: string;
        role: string;
        email: string;
      };

      const user = await this.userRepo.findById(payload.sub);
      if (!user) throw new AppError(401, "User not found");

      return user;
    } catch (error) {
      throw new AppError(401, "Invalid token");
    }
  }
}
