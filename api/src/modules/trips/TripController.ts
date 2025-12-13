import { Request, Response, NextFunction } from "express";
import { TripService } from "./TripService";
import { notifyDriver } from "../../utils/socket";

export class TripController {
  constructor(private service: TripService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trip = await this.service.createTrip(req.body);
      
      // Notify the driver about the new trip assignment
      notifyDriver(req.body.driverId, "tripAssigned", {
        message: `Nouveau trajet assigné: ${trip.reference} (${trip.origin} → ${trip.destination})`,
        tripId: trip._id,
        reference: trip.reference,
        origin: trip.origin,
        destination: trip.destination,
        plannedStart: trip.plannedStart,
      });
      
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
      const user = (req as any).user;
      const { status, ...updates } = req.body;
      const updated = await this.service.updateStatus(req.params.id, status, updates, user.id, user.role);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  };

  downloadPdf = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const buffer = await this.service.generateTripPdf(req.params.id, user.id, user.role);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=trip-${req.params.id}.pdf`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  };
}
