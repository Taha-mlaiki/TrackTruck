import { Request, Response, NextFunction } from "express";
import { TireService } from "../services/TireService";

export class TireController {
  constructor(private service: TireService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tire = await this.service.createTire(req.body);
      res.status(201).json(tire);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tire = await this.service.getTireById(req.params.id);
      res.json(tire);
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tires = await this.service.listTires();
      res.json(tires);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await this.service.updateTire(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deleteTire(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
