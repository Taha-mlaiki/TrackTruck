import { TruckModel, ITruckDoc } from "../model/Tire.model";
import { ITruckRepository } from "./ITruckRepository";

export class TruckRepository implements ITruckRepository {
  async create(data: Partial<ITruckDoc>): Promise<ITruckDoc> {
    const doc = new TruckModel(data);
    return doc.save();
  }
  async findById(id: string) {
    return TruckModel.findById(id).exec();
  }
  async find(filter = {}) {
    return TruckModel.find(filter).exec();
  }
  async update(id: string, update: Partial<ITruckDoc>) {
    return TruckModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }
  async delete(id: string) {
    await TruckModel.findByIdAndDelete(id).exec();
  }
}
