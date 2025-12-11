import { Request, Response, NextFunction } from "express";
import { TruckService } from "../services/TruckService";

export class TruckController {
  constructor(private service: TruckService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const truck = await this.service.createTruck(req.body);
      res.status(201).json(truck);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const truck = await this.service.getTruckById(req.params.id);
      res.json(truck);
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trucks = await this.service.listTrucks();
      res.json(trucks);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await this.service.updateTruck(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deleteTruck(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
