import { NextFunction, Request, Response } from "express";
import { UserService } from "./UserService";
import { CreateUserDTO } from "./CreateUserDTO";

export class UserController {
  constructor(private userService: UserService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as CreateUserDTO;
      console.log(req.body);
      const user = await this.userService.createUser(data);
      const { password, ...rest } = (user as any).toObject();
      return res.status(201).json(rest);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.getUserById(req.params.id);
      const { password, ...rest } = (user as any).toObject();
      res.json(rest);
    } catch (err) {
      next(err);
    }
  };
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.listUsers();
      const safe = users.map((u) => {
        const { password, ...rest } = (u as any).toObject();
        return rest;
      });
      res.json(safe);
    } catch (err) {
      next(err);
    }
  };
}
