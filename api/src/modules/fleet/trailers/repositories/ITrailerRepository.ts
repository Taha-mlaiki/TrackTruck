import { ITrailer } from "../model/Trailer.model";

export interface ITrailerRepository {
  create(data: Partial<ITrailer>): Promise<ITrailer>;
  findById(id: string): Promise<ITrailer | null>;
  find(filter?: any): Promise<ITrailer[]>;
  update(id: string, update: Partial<ITrailer>): Promise<ITrailer | null>;
  delete(id: string): Promise<void>;
}
