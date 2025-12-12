import { Request, Response, NextFunction } from "express";
import { TripService } from "./TripService";

export class TripController {
  constructor(private service: TripService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trip = await this.service.createTrip(req.body);
      res.status(201).json(trip);
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const trips = await this.service.listForUser(user.id, user.role);
      res.json(trips);
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, ...updates } = req.body;
      const updated = await this.service.updateStatus(req.params.id, status, updates);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  };

  downloadPdf = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const buffer = await this.service.generateTripPdf(req.params.id);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=trip-${req.params.id}.pdf`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  };
}
