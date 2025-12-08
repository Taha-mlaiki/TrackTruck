import { UserRepo } from "../repositories/UserRepo";
import bcrypt from "bcryptjs";

export class UserService {
  private userRepo: UserRepo;
  constructor() {
    this.userRepo = new UserRepo();
  }

  async getAllDrivers() {
    return await this.userRepo.getAllDrivers();
  }

  async findUserByEmail(email: string) {
    const user = await this.userRepo.findUserByEmail(email);
    if (!user) throw new Error("User not found");
    return user;
  }

  async findUserByPhone(phone: string) {
    const user = await this.userRepo.findUserByPhone(phone);
    if (!user) throw new Error("User not found");
    return user;
  }
  async createUser({
    full_name,
    email,
    password,
    phone,
    role,
  }: {
    full_name: string;
    email: string;
    password: string;
    phone: string;
    role: string;
  }) {
    const isEmailExists = await this.userRepo.findUserByEmail(email);
    if (isEmailExists) throw new Error("Email already exists");

    const isPhoneExists = await this.userRepo.findUserByPhone(phone);
    if (isPhoneExists) throw new Error("Phone already exists");

    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
      full_name,
      email,
      password: passwordHash,
      phone,
      role,
    };
    return await this.userRepo.createUser(user);
  }
}
