import { TruckService } from "../modules/fleet/trucks/TruckService";
import { 
  createMockTruckRepository, 
  sampleTruck
} from "./helpers/mocks";
import { NotFoundError } from "../errors/NotFoundError";

describe("TruckService", () => {
  let service: TruckService;
  let mockRepo: ReturnType<typeof createMockTruckRepository>;

  beforeEach(() => {
    mockRepo = createMockTruckRepository();
    service = new TruckService(mockRepo as any);
    jest.clearAllMocks();
  });

  describe("createTruck", () => {
    const createTruckDto = {
      plateNumber: "XYZ-789",
      modelName: "Mercedes Actros",
      odometerKm: 10000,
      isActive: true,
    };

    it("should create truck successfully", async () => {
      mockRepo.create.mockResolvedValue({ ...sampleTruck, ...createTruckDto });

      const result = await service.createTruck(createTruckDto);

      expect(mockRepo.create).toHaveBeenCalledWith(createTruckDto);
      expect(result.plateNumber).toBe(createTruckDto.plateNumber);
    });
  });

  describe("getTruckById", () => {
    it("should return truck if found", async () => {
      mockRepo.findById.mockResolvedValue(sampleTruck);

      const result = await service.getTruckById(sampleTruck._id);

      expect(mockRepo.findById).toHaveBeenCalledWith(sampleTruck._id);
      expect(result._id).toBe(sampleTruck._id);
    });

    it("should throw NotFoundError if truck not found", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.getTruckById("nonexistent")).rejects.toThrow(NotFoundError);
      await expect(service.getTruckById("nonexistent")).rejects.toThrow("Truck not found");
    });
  });

  describe("listTrucks", () => {
    it("should return all trucks", async () => {
      mockRepo.find.mockResolvedValue([sampleTruck]);

      const result = await service.listTrucks();

      expect(mockRepo.find).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe(sampleTruck._id);
    });

    it("should return empty array if no trucks", async () => {
      mockRepo.find.mockResolvedValue([]);

      const result = await service.listTrucks();

      expect(result).toHaveLength(0);
    });
  });

  describe("updateTruck", () => {
    const updateDto = { odometerKm: 60000 };

    it("should update truck successfully", async () => {
      mockRepo.update.mockResolvedValue({ ...sampleTruck, ...updateDto });

      const result = await service.updateTruck(sampleTruck._id, updateDto);

      expect(mockRepo.update).toHaveBeenCalledWith(sampleTruck._id, updateDto);
      expect(result.odometerKm).toBe(updateDto.odometerKm);
    });

    it("should throw NotFoundError if truck not found", async () => {
      mockRepo.update.mockResolvedValue(null);

      await expect(service.updateTruck("nonexistent", updateDto)).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteTruck", () => {
    it("should delete truck successfully", async () => {
      mockRepo.delete.mockResolvedValue(true);

      await service.deleteTruck(sampleTruck._id);

      expect(mockRepo.delete).toHaveBeenCalledWith(sampleTruck._id);
    });
  });
});
