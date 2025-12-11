import { NotFoundError } from "../../../../cors/errors/NotFoundError";
import { ITireRepository } from "../repositories/ITireRepository";
import { ITire } from "../model/Tire.model";
import { TireRepository } from "../repositories/TireRepository";

export class TireService {
  constructor(private tireRepo: ITireRepository = new TireRepository()) {}

  async createTire(data: Partial<ITire>) {
    return this.tireRepo.create(data);
  }

  async getTireById(id: string) {
    const tire = await this.tireRepo.findById(id);
    if (!tire) throw new NotFoundError("Tire not found");
    return tire;
  }

  async listTires() {
    return this.tireRepo.find();
  }

  async updateTire(id: string, data: Partial<ITire>) {
    const updated = await this.tireRepo.update(id, data);
    if (!updated) throw new NotFoundError("Tire not found");
    return updated;
  }

  async deleteTire(id: string) {
    await this.tireRepo.delete(id);
  }
}
