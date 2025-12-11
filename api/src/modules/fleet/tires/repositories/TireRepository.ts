import { ITire, TireModel } from "../model/Tire.model";
import { ITireRepository } from "./ITireRepository";

export class TireRepository implements ITireRepository {
  async create(data: Partial<ITire>): Promise<ITire> {
    const doc = new TireModel(data);
    return doc.save();
  }

  async findById(id: string): Promise<ITire | null> {
    return TireModel.findById(id).exec();
  }

  async find(filter = {}): Promise<ITire[]> {
    return TireModel.find(filter).exec();
  }

  async update(id: string, update: Partial<ITire>): Promise<ITire | null> {
    return TireModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await TireModel.findByIdAndDelete(id).exec();
  }
}
