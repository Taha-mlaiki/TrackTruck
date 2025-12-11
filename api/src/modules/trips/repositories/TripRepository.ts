import { TripModel, ITripDoc } from "../model/Trip.model";
import { ITripRepository } from "./ITripRepository";

export class TripRepository implements ITripRepository {
  async create(data: Partial<ITripDoc>) {
    const doc = new TripModel(data);
    return doc.save();
  }

  async findById(id: string) {
    return TripModel.findById(id).populate("truck").populate("trailer").populate("driver").exec();
  }

  async find(filter = {}) {
    return TripModel.find(filter).populate("truck").populate("trailer").populate("driver").exec();
  }

  async update(id: string, update: Partial<ITripDoc>) {
    return TripModel.findByIdAndUpdate(id, update, { new: true }).populate("truck").populate("trailer").populate("driver").exec();
  }
}
