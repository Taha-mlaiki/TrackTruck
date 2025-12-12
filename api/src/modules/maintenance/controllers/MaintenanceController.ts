import { Request, Response, NextFunction } from "express";
import { MaintenanceService } from "../services/MaintencanceService";

export class MaintenanceController {
  constructor(private service: MaintenanceService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const maintenance = await this.service.createMaintenace(req.body);
      res.status(201).json(maintenance);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const maintenance = await this.service.getMaintencance(req.params.id);
      res.json(maintenance);
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const maintenances = await this.service.getAllMaintenace(req.query);
      res.json(maintenances);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await this.service.updateMaintenace(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deleteMaintenace(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
