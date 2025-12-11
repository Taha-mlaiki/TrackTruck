import { ITruckDoc } from "../model/Truck.model";

export interface ITruckRepository {
  create(data: Partial<ITruckDoc>): Promise<ITruckDoc>;
  findById(id: string): Promise<ITruckDoc | null>;
  find(filter?: any): Promise<ITruckDoc[]>;
  update(id: string, update: Partial<ITruckDoc>): Promise<ITruckDoc | null>;
  delete(id: string): Promise<void>;
}
