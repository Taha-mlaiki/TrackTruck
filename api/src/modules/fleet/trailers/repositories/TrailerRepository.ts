import { ITrailer, Trailer } from "../model/Trailer.model";
import { ITrailerRepository } from "./ITrailerRepository";

export class TrailerRepository implements ITrailerRepository {
  async create(data: Partial<ITrailer>): Promise<ITrailer> {
    const doc = new Trailer(data);
    return doc.save();
  }

  async findById(id: string): Promise<ITrailer | null> {
    return Trailer.findById(id).exec();
  }

  async find(filter = {}): Promise<ITrailer[]> {
    return Trailer.find(filter).exec();
  }

  async update(
    id: string,
    update: Partial<ITrailer>
  ): Promise<ITrailer | null> {
    return Trailer.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await Trailer.findByIdAndDelete(id).exec();
  }
}
