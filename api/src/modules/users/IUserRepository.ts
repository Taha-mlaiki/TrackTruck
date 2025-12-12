import { CreateUserDTO } from "./CreateUserDTO";
import { IUserDoc } from "./User.model";

//! what partial means in the create function
export interface IUserRepository {
  create(data: Partial<IUserDoc>): Promise<IUserDoc>;
  findById(id: string): Promise<IUserDoc | null>;
  findByEmail(email: string): Promise<IUserDoc | null>;
  list(filter?: any): Promise<IUserDoc[]>;
  update(id: string, update: Partial<IUserDoc>): Promise<IUserDoc | null>;
}
