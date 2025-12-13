import { IFuelDoc } from "./Fuel.model";

export interface IFuelRepository {
  create(data: Partial<IFuelDoc>): Promise<IFuelDoc>;
  findById(id: string): Promise<IFuelDoc | null>;
  find(filter?: Record<string, unknown>): Promise<IFuelDoc[]>;
  update(id: string, data: Partial<IFuelDoc>): Promise<IFuelDoc | null>;
  delete(id: string): Promise<boolean>;
  findByTruck(truckId: string): Promise<IFuelDoc[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<IFuelDoc[]>;
  getTotalConsumptionByTruck(truckId: string): Promise<number>;
  getTotalCostByTruck(truckId: string): Promise<number>;
}
