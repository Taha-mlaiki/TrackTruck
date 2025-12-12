import { AppError } from "../../../cors/errors/AppError";
import { hashPassword } from "../../../utils/password.util";
import { CreateUserDTO } from "../CreateUserDTO";
import { UserRepository } from "../UserRepository";

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async createUser(dto: CreateUserDTO) {
    const isExist = await this.userRepo.findByEmail(dto.email);
    if (isExist) throw new AppError(409, "Email already in use");
    const passwordHash = await hashPassword(dto.password);
    const user = await this.userRepo.create({
      ...dto,
      password: passwordHash,
    });
    return user;
  }
  async getUserById(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new AppError(404, "User not found");
    return user;
  }

  async updateUser(id: string, update: Partial<any>) {
    const user = await this.userRepo.update(id, update);
    if (!user) throw new AppError(404, "User not Updated");
    return user;
  }
  async listUsers() {
    return this.userRepo.list();
  }
}
