import { ITripDoc } from "./Trip.model";

export interface ITripRepository {
  create(data: Partial<ITripDoc>): Promise<ITripDoc>;
  findById(id: string): Promise<ITripDoc | null>;
  find(filter?: any): Promise<ITripDoc[]>;
  update(id: string, update: Partial<ITripDoc>): Promise<ITripDoc | null>;
}
