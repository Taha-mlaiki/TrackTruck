import { User } from "../models/User";

export class UserRepo {
  async getAllDrivers() {
    return await User.find({ role: "Driver" });
  }
  async findUserByEmail(email: string) {
    return await User.findOne({ email });
  }
  async findUserByPhone(phone: string) {
    return await User.findOne({ phone });
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
    return await User.create({ full_name, email, password, phone, role });
  }
}
