import jwt from "jsonwebtoken";
import { NotFoundError } from "../../../cors/errors/NotFoundError";
import { comparPwd } from "../../../utils/password.util";
import { AppError } from "../../../cors/errors/AppError";
import config from "../../../config";
import { IUserRepository } from "../../users/repositories/IUserRepository";

export class AuthService {
  constructor(private userRepo: IUserRepository) {}

  async login(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new NotFoundError("User not found");
    const ok = await comparPwd(password, user.password);
    if (!ok) throw new AppError(401, "Invalid credentials");

    const payload: object = { sub: user.id, role: user.role, email: user.email };
    const jwtSecret: string = process.env.JWT_SECRET || "change me please";
    const jwtExpiresIn: string | number = config.JWT_EXPIRES_IN || "1h";

    const token = jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: jwtExpiresIn } as jwt.SignOptions
    );

    return { token, user };
  }
}
