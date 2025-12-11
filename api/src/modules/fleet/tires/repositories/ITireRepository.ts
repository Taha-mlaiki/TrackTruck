import { ITire } from "../model/Tire.model";

export interface ITireRepository {
  create(data: Partial<ITire>): Promise<ITire>;
  findById(id: string): Promise<ITire | null>;
  find(filter?: any): Promise<ITire[]>;
  update(id: string, update: Partial<ITire>): Promise<ITire | null>;
  delete(id: string): Promise<void>;
}
