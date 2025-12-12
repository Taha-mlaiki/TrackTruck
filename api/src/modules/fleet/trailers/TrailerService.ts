import { ITrailerRepository } from "./ITrailerRepository";
import { TrailerRepository } from "./TrailerRepository";
import { ITrailer } from "./Trailer.model";
import { NotFoundError } from "../../../errors/NotFoundError";

export class TrailerService {
  constructor(
    private trailerRepo: ITrailerRepository = new TrailerRepository()
  ) {}

  async createTrailer(data: Partial<ITrailer>) {
    return this.trailerRepo.create(data);
  }

  async getTrailerById(id: string) {
    const trailer = await this.trailerRepo.findById(id);
    if (!trailer) throw new NotFoundError("Trailer not found");
    return trailer;
  }

  async listTrailers() {
    return this.trailerRepo.find();
  }

  async updateTrailer(id: string, data: Partial<ITrailer>) {
    const updated = await this.trailerRepo.update(id, data);
    if (!updated) throw new NotFoundError("Trailer not found");
    return updated;
  }

  async deleteTrailer(id: string) {
    await this.trailerRepo.delete(id);
  }
}
