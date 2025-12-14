import { FuelService } from "../modules/fuel/FuelService";
import { 
  createMockFuelRepository, 
  createMockTruckRepository,
  sampleUser, 
  sampleTruck, 
  sampleFuel,
  sampleAdmin
} from "./helpers/mocks";
import { NotFoundError } from "../errors/NotFoundError";
import { AppError } from "../errors/AppError";

describe("FuelService", () => {
  let service: FuelService;
  let mockFuelRepo: ReturnType<typeof createMockFuelRepository>;
  let mockTruckRepo: ReturnType<typeof createMockTruckRepository>;

  beforeEach(() => {
    mockFuelRepo = createMockFuelRepository();
    mockTruckRepo = createMockTruckRepository();
    
    service = new FuelService(mockFuelRepo as any, mockTruckRepo as any);
    jest.clearAllMocks();
  });

  describe("create", () => {
    const createFuelDto = {
      truckId: sampleTruck._id,
      liters: 100,
      costPerLiter: 12.5,
      odometerAtFill: 50500,
      fuelType: "diesel" as const,
    };

    it("should create fuel record successfully", async () => {
      mockTruckRepo.findById.mockResolvedValue(sampleTruck);
      mockFuelRepo.create.mockResolvedValue({ ...sampleFuel, ...createFuelDto });
      mockTruckRepo.update.mockResolvedValue(sampleTruck);

      const result = await service.create(createFuelDto, sampleUser._id);

      expect(mockTruckRepo.findById).toHaveBeenCalledWith(createFuelDto.truckId);
      expect(mockFuelRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        liters: createFuelDto.liters,
        totalCost: createFuelDto.liters * createFuelDto.costPerLiter, // 1250
      }));
      expect(result.liters).toBe(createFuelDto.liters);
    });

    it("should throw NotFoundError if truck not found", async () => {
      mockTruckRepo.findById.mockResolvedValue(null);

      await expect(service.create(createFuelDto, sampleUser._id)).rejects.toThrow(NotFoundError);
      await expect(service.create(createFuelDto, sampleUser._id)).rejects.toThrow("Truck not found");
    });

    it("should update truck odometer if new reading is higher", async () => {
      mockTruckRepo.findById.mockResolvedValue({ ...sampleTruck, odometerKm: 50000 });
      mockFuelRepo.create.mockResolvedValue(sampleFuel);
      mockTruckRepo.update.mockResolvedValue(sampleTruck);

      await service.create(createFuelDto, sampleUser._id);

      expect(mockTruckRepo.update).toHaveBeenCalledWith(
        sampleTruck.id, 
        { odometerKm: createFuelDto.odometerAtFill }
      );
    });

    it("should not update truck odometer if reading is lower", async () => {
      mockTruckRepo.findById.mockResolvedValue({ ...sampleTruck, odometerKm: 60000 });
      mockFuelRepo.create.mockResolvedValue(sampleFuel);

      await service.create(createFuelDto, sampleUser._id);

      expect(mockTruckRepo.update).not.toHaveBeenCalled();
    });

    it("should calculate total cost correctly", async () => {
      mockTruckRepo.findById.mockResolvedValue(sampleTruck);
      mockFuelRepo.create.mockResolvedValue(sampleFuel);

      await service.create(createFuelDto, sampleUser._id);

      expect(mockFuelRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        totalCost: 1250, // 100 * 12.5
      }));
    });
  });

  describe("findAll", () => {
    it("should return all fuel records for admin", async () => {
      mockFuelRepo.find.mockResolvedValue([sampleFuel]);

      const result = await service.findAll(sampleAdmin._id, "Admin");

      expect(mockFuelRepo.find).toHaveBeenCalledWith();
      expect(result).toHaveLength(1);
    });

    it("should filter by user for non-admin", async () => {
      mockFuelRepo.find.mockResolvedValue([sampleFuel]);

      await service.findAll(sampleUser._id, "Driver");

      expect(mockFuelRepo.find).toHaveBeenCalledWith({ filledBy: sampleUser._id });
    });
  });

  describe("findById", () => {
    it("should return fuel record if found", async () => {
      mockFuelRepo.findById.mockResolvedValue(sampleFuel);

      const result = await service.findById(sampleFuel._id);

      expect(result._id).toBe(sampleFuel._id);
    });

    it("should throw NotFoundError if not found", async () => {
      mockFuelRepo.findById.mockResolvedValue(null);

      await expect(service.findById("nonexistent")).rejects.toThrow(NotFoundError);
    });
  });

  describe("update", () => {
    const updateDto = { liters: 150 };

    it("should update fuel record successfully", async () => {
      const fuel = { ...sampleFuel, filledBy: { _id: sampleUser._id } };
      mockFuelRepo.findById.mockResolvedValue(fuel);
      mockFuelRepo.update.mockResolvedValue({ ...fuel, ...updateDto });

      const result = await service.update(sampleFuel._id, updateDto, sampleUser._id, "Driver");

      expect(mockFuelRepo.update).toHaveBeenCalled();
    });

    it("should throw NotFoundError if not found", async () => {
      mockFuelRepo.findById.mockResolvedValue(null);

      await expect(service.update("nonexistent", updateDto, sampleUser._id, "Driver")).rejects.toThrow(NotFoundError);
    });

    it("should throw AppError if user doesn't own the record", async () => {
      const fuel = { ...sampleFuel, filledBy: { _id: "different-user" } };
      mockFuelRepo.findById.mockResolvedValue(fuel);

      await expect(
        service.update(sampleFuel._id, updateDto, sampleUser._id, "Driver")
      ).rejects.toThrow(AppError);
      await expect(
        service.update(sampleFuel._id, updateDto, sampleUser._id, "Driver")
      ).rejects.toThrow("your own fuel records");
    });

    it("should allow admin to update any record", async () => {
      const fuel = { ...sampleFuel, filledBy: { _id: "different-user" } };
      mockFuelRepo.findById.mockResolvedValue(fuel);
      mockFuelRepo.update.mockResolvedValue({ ...fuel, ...updateDto });

      const result = await service.update(sampleFuel._id, updateDto, sampleAdmin._id, "Admin");

      expect(mockFuelRepo.update).toHaveBeenCalled();
    });

    it("should recalculate total cost when liters change", async () => {
      const fuel = { ...sampleFuel, filledBy: { _id: sampleUser._id }, costPerLiter: 12 };
      mockFuelRepo.findById.mockResolvedValue(fuel);
      mockFuelRepo.update.mockResolvedValue({ ...fuel, liters: 150, totalCost: 1800 });

      await service.update(sampleFuel._id, { liters: 150 }, sampleUser._id, "Driver");

      expect(mockFuelRepo.update).toHaveBeenCalledWith(
        sampleFuel._id,
        expect.objectContaining({ totalCost: 1800 }) // 150 * 12
      );
    });
  });

  describe("delete", () => {
    it("should delete fuel record successfully", async () => {
      const fuel = { ...sampleFuel, filledBy: { _id: sampleUser._id } };
      mockFuelRepo.findById.mockResolvedValue(fuel);
      mockFuelRepo.delete.mockResolvedValue(true);

      await service.delete(sampleFuel._id, sampleUser._id, "Driver");

      expect(mockFuelRepo.delete).toHaveBeenCalledWith(sampleFuel._id);
    });

    it("should throw NotFoundError if not found", async () => {
      mockFuelRepo.findById.mockResolvedValue(null);

      await expect(service.delete("nonexistent", sampleUser._id, "Driver")).rejects.toThrow(NotFoundError);
    });

    it("should throw AppError if user doesn't own the record", async () => {
      const fuel = { ...sampleFuel, filledBy: { _id: "different-user" } };
      mockFuelRepo.findById.mockResolvedValue(fuel);

      await expect(
        service.delete(sampleFuel._id, sampleUser._id, "Driver")
      ).rejects.toThrow(AppError);
    });

    it("should allow admin to delete any record", async () => {
      const fuel = { ...sampleFuel, filledBy: { _id: "different-user" } };
      mockFuelRepo.findById.mockResolvedValue(fuel);
      mockFuelRepo.delete.mockResolvedValue(true);

      await service.delete(sampleFuel._id, sampleAdmin._id, "Admin");

      expect(mockFuelRepo.delete).toHaveBeenCalled();
    });
  });

  describe("getStats", () => {
    it("should return fuel statistics", async () => {
      const mockStats = {
        totalLiters: 500,
        totalCost: 6250,
        avgCostPerLiter: 12.5,
        recordCount: 5,
      };
      mockFuelRepo.getConsumptionStats.mockResolvedValue(mockStats);

      const result = await service.getStats({});

      expect(mockFuelRepo.getConsumptionStats).toHaveBeenCalled();
      expect(result.totalLiters).toBe(500);
    });

    it("should filter by truck ID", async () => {
      mockFuelRepo.getConsumptionStats.mockResolvedValue({});

      await service.getStats({ truckId: sampleTruck._id });

      expect(mockFuelRepo.getConsumptionStats).toHaveBeenCalledWith(
        expect.objectContaining({ truck: sampleTruck._id })
      );
    });

    it("should filter by date range", async () => {
      mockFuelRepo.getConsumptionStats.mockResolvedValue({});

      await service.getStats({ 
        startDate: "2024-01-01", 
        endDate: "2024-12-31" 
      });

      expect(mockFuelRepo.getConsumptionStats).toHaveBeenCalledWith(
        expect.objectContaining({ 
          date: expect.objectContaining({
            $gte: expect.any(Date),
            $lte: expect.any(Date),
          })
        })
      );
    });
  });
});
