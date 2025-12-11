import { NotFoundError } from "../../../../cors/errors/NotFoundError";
import { ITruckRepository } from "../repositories/ITruckRepository";

export class TruckService {
  constructor(private truckRepo: ITruckRepository) {}

  async createTruck(data: Partial<any>) {
    return this.truckRepo.create(data);
  }

  async getTruckById(id: string) {
    const truck = await this.truckRepo.findById(id);
    if (!truck) throw new NotFoundError("Truck not found");
    return truck;
  }

  async listTrucks() {
    return this.truckRepo.find();
  }

  async updateTruck(id: string, data: Partial<any>) {
    const updated = await this.truckRepo.update(id, data);
    if (!updated) throw new NotFoundError("Truck not found");
    return updated;
  }

  async deleteTruck(id: string) {
    await this.truckRepo.delete(id);
  }
}
