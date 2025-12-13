import { Request, Response, NextFunction } from "express";
import { FuelService } from "./FuelService";

export class FuelController {
  constructor(private service: FuelService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const fuel = await this.service.create(req.body, user.id);
      res.status(201).json(fuel);
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const fuels = await this.service.findAll(user.id, user.role);
      res.json(fuels);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fuel = await this.service.findById(req.params.id);
      res.json(fuel);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const fuel = await this.service.update(req.params.id, req.body, user.id, user.role);
      res.json(fuel);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      await this.service.delete(req.params.id, user.id, user.role);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  getByTruck = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fuels = await this.service.getByTruck(req.params.truckId);
      res.json(fuels);
    } catch (err) {
      next(err);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { truckId, startDate, endDate } = req.query;
      const stats = await this.service.getStats({
        truckId: truckId as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });
      res.json(stats);
    } catch (err) {
      next(err);
    }
  };
}
