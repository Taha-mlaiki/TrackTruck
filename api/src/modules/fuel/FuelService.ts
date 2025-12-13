import { FuelRepository } from "./FuelRepository";
import { CreateFuelDTO, UpdateFuelDTO } from "./CreateFuelDTO";
import { NotFoundError } from "../../errors/NotFoundError";
import { AppError } from "../../errors/AppError";
import { ITruckRepository } from "../fleet/trucks/ITruckRepository";

export class FuelService {
  constructor(
    private fuelRepo: FuelRepository,
    private truckRepo: ITruckRepository
  ) {}

  async create(dto: CreateFuelDTO, userId: string) {
    // Verify truck exists
    const truck = await this.truckRepo.findById(dto.truckId);
    if (!truck) throw new NotFoundError("Truck not found");

    // Calculate total cost
    const totalCost = dto.liters * dto.costPerLiter;

    const fuelData = {
      truck: dto.truckId,
      trip: dto.tripId,
      liters: dto.liters,
      costPerLiter: dto.costPerLiter,
      totalCost,
      odometerAtFill: dto.odometerAtFill,
      station: dto.station,
      fuelType: dto.fuelType || "diesel",
      filledBy: userId,
      date: dto.date ? new Date(dto.date) : new Date(),
      notes: dto.notes,
    };

    const fuel = await this.fuelRepo.create(fuelData as any);

    // Update truck odometer if this fill is at a higher odometer reading
    if (dto.odometerAtFill > truck.odometerKm) {
      await this.truckRepo.update(truck.id, { odometerKm: dto.odometerAtFill });
    }

    return fuel;
  }

  async findAll(userId: string, userRole: string) {
    // Admin sees all, drivers see only their records
    if (userRole === "Admin") {
      return this.fuelRepo.find();
    }
    return this.fuelRepo.find({ filledBy: userId });
  }

  async findById(id: string) {
    const fuel = await this.fuelRepo.findById(id);
    if (!fuel) throw new NotFoundError("Fuel record not found");
    return fuel;
  }

  async update(id: string, dto: UpdateFuelDTO, userId: string, userRole: string) {
    const fuel = await this.fuelRepo.findById(id);
    if (!fuel) throw new NotFoundError("Fuel record not found");

    // Only admin or the person who created the record can update
    const filledById = (fuel.filledBy as any)._id?.toString() || fuel.filledBy.toString();
    if (userRole !== "Admin" && filledById !== userId) {
      throw new AppError(403, "You can only update your own fuel records");
    }

    const updateData: any = { ...dto };
    if (dto.truckId) updateData.truck = dto.truckId;
    if (dto.tripId) updateData.trip = dto.tripId;
    delete updateData.truckId;
    delete updateData.tripId;

    // Recalculate total cost if liters or costPerLiter changed
    if (dto.liters || dto.costPerLiter) {
      const liters = dto.liters ?? fuel.liters;
      const costPerLiter = dto.costPerLiter ?? fuel.costPerLiter;
      updateData.totalCost = liters * costPerLiter;
    }

    return this.fuelRepo.update(id, updateData);
  }

  async delete(id: string, userId: string, userRole: string) {
    const fuel = await this.fuelRepo.findById(id);
    if (!fuel) throw new NotFoundError("Fuel record not found");

    // Only admin or the person who created the record can delete
    const filledById = (fuel.filledBy as any)._id?.toString() || fuel.filledBy.toString();
    if (userRole !== "Admin" && filledById !== userId) {
      throw new AppError(403, "You can only delete your own fuel records");
    }

    return this.fuelRepo.delete(id);
  }

  async getByTruck(truckId: string) {
    return this.fuelRepo.findByTruck(truckId);
  }

  async getStats(filter?: { truckId?: string; startDate?: string; endDate?: string }) {
    const query: any = {};
    
    if (filter?.truckId) {
      query.truck = filter.truckId;
    }
    if (filter?.startDate || filter?.endDate) {
      query.date = {};
      if (filter.startDate) query.date.$gte = new Date(filter.startDate);
      if (filter.endDate) query.date.$lte = new Date(filter.endDate);
    }

    return this.fuelRepo.getConsumptionStats(query);
  }
}
