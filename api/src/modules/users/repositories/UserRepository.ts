import { IUserDoc, User } from "../model/User.model";
import { IUserRepository } from "./IUserRepository";

export class UserRepository implements IUserRepository {
  create(data: Partial<IUserDoc>): Promise<IUserDoc> {
    const user = new User(data);
    return user.save();
  }
  update(id: string, update: Partial<IUserDoc>): Promise<IUserDoc | null> {
    //! what does the {new:true} means
    //! what does the exec means
    return User.findByIdAndUpdate(id, update, { new: true }).exec();
  }
  findById(id: string): Promise<IUserDoc | null> {
    return User.findById(id).exec();
  }
  findByEmail(email: string): Promise<IUserDoc | null> {
    return User.findOne({ email }).exec();
  }
  list(filter = {}): Promise<IUserDoc[]> {
    //! what does the filter mean 
    return User.find(filter).exec();
  }
}
