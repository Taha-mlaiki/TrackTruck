import { FuelModel, IFuelDoc } from "./Fuel.model";
import { IFuelRepository } from "./IFuelRepository";

export class FuelRepository implements IFuelRepository {
  async create(data: Partial<IFuelDoc>): Promise<IFuelDoc> {
    const fuel = new FuelModel(data);
    return fuel.save();
  }

  async findById(id: string): Promise<IFuelDoc | null> {
    return FuelModel.findById(id)
      .populate("truck", "plateNumber modelName")
      .populate("trip", "reference origin destination")
      .populate("filledBy", "name email");
  }

  async find(filter?: Record<string, unknown>): Promise<IFuelDoc[]> {
    return FuelModel.find(filter || {})
      .populate("truck", "plateNumber modelName")
      .populate("trip", "reference origin destination")
      .populate("filledBy", "name email")
      .sort({ date: -1 });
  }

  async update(id: string, data: Partial<IFuelDoc>): Promise<IFuelDoc | null> {
    return FuelModel.findByIdAndUpdate(id, data, { new: true })
      .populate("truck", "plateNumber modelName")
      .populate("trip", "reference origin destination")
      .populate("filledBy", "name email");
  }

  async delete(id: string): Promise<boolean> {
    const result = await FuelModel.findByIdAndDelete(id);
    return !!result;
  }

  async findByTruck(truckId: string): Promise<IFuelDoc[]> {
    return FuelModel.find({ truck: truckId })
      .populate("truck", "plateNumber modelName")
      .populate("trip", "reference origin destination")
      .populate("filledBy", "name email")
      .sort({ date: -1 });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<IFuelDoc[]> {
    return FuelModel.find({
      date: { $gte: startDate, $lte: endDate }
    })
      .populate("truck", "plateNumber modelName")
      .populate("trip", "reference origin destination")
      .populate("filledBy", "name email")
      .sort({ date: -1 });
  }

  async getTotalConsumptionByTruck(truckId: string): Promise<number> {
    const result = await FuelModel.aggregate([
      { $match: { truck: truckId } },
      { $group: { _id: null, total: { $sum: "$liters" } } }
    ]);
    return result[0]?.total || 0;
  }

  async getTotalCostByTruck(truckId: string): Promise<number> {
    const result = await FuelModel.aggregate([
      { $match: { truck: truckId } },
      { $group: { _id: null, total: { $sum: "$totalCost" } } }
    ]);
    return result[0]?.total || 0;
  }

  async getConsumptionStats(filter?: Record<string, unknown>): Promise<{
    totalLiters: number;
    totalCost: number;
    avgCostPerLiter: number;
    recordCount: number;
  }> {
    const matchStage = filter ? { $match: filter } : { $match: {} };
    const result = await FuelModel.aggregate([
      matchStage,
      {
        $group: {
          _id: null,
          totalLiters: { $sum: "$liters" },
          totalCost: { $sum: "$totalCost" },
          avgCostPerLiter: { $avg: "$costPerLiter" },
          recordCount: { $sum: 1 }
        }
      }
    ]);
    return result[0] || { totalLiters: 0, totalCost: 0, avgCostPerLiter: 0, recordCount: 0 };
  }
}
