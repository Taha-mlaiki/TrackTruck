import { ITripRepository } from "../repositories/ITripRepository";
import { IUserRepository } from "../../users/repositories/IUserRepository";
import { ITruckRepository } from "../../fleet/trucks/repositories/ITruckRepository";
import { CreateTripDTO } from "../dto/CreateTripDTO";
import { PdfService } from "../../../utils/pdf.service";
import { NotFoundError } from "../../../cors/errors/NotFoundError";
import { AppError } from "../../../cors/errors/AppError";
import { TripStatus } from "../model/Trip.model";

export class TripService {
  constructor(
    private tripRepo: ITripRepository,
    private userRepo: IUserRepository,
    private truckRepo: ITruckRepository,
    private pdfService: PdfService
  ) {}

  async createTrip(dto: CreateTripDTO) {
    const driver = await this.userRepo.findById(dto.driverId);
    if (!driver) throw new NotFoundError("Driver not found");
    if (driver.role !== "Driver") throw new AppError(400, "Assigned user is not a driver");

    const truck = await this.truckRepo.findById(dto.truckId);
    if (!truck) throw new NotFoundError("Truck not found");
    if (truck.assignedTo) throw new AppError(400, "Truck already assigned");

    const tripData = {
      reference: dto.reference,
      origin: dto.origin,
      destination: dto.destination,
      plannedStart: new Date(dto.plannedStart),
      truck: dto.truckId,
      trailer: dto.trailerId,
      driver: dto.driverId
    };

    const trip = await this.tripRepo.create(tripData as any);
    await this.truckRepo.update(truck.id, { assignedTo: dto.driverId });
    return trip;
  }

  async updateStatus(tripId: string, status: TripStatus, updates: Partial<any>) {
    const trip = await this.tripRepo.findById(tripId);
    if (!trip) throw new NotFoundError("Trip not found");

    if (status === "completed") {
      if (typeof updates.endOdometer !== "number") {
        throw new AppError(400, "endOdometer required on completion");
      }
      if (trip.startOdometer === undefined && typeof updates.startOdometer !== "number") {
        throw new AppError(400, "startOdometer required if not present");
      }
      const truck = trip.truck as any;
      const endOdo = updates.endOdometer;
      if (truck) {
        await this.truckRepo.update(truck._id, { odometerKm: endOdo });
      }
    }

    const updated = await this.tripRepo.update(tripId, { status, ...updates });
    return updated;
  }

  async listForUser(userId: string, role: string) {
    if (role === "admin") return this.tripRepo.find();
    return this.tripRepo.find({ driver: userId });
  }

  async generateTripPdf(tripId: string) {
    const trip = await this.tripRepo.findById(tripId);
    if (!trip) throw new NotFoundError("Trip not found");
    return this.pdfService.generateTripPdfBuffer(trip);
  }
}
