import { MaintenanceService } from "../modules/maintenance/services/MaintenanceService";
import { 
  createMockRepository, 
  createMockTruckRepository,
  sampleTruck
} from "./helpers/mocks";
import { NotFoundError } from "../errors/NotFoundError";

// Mock the notification service
jest.mock("../modules/maintenance/services/notification.service", () => ({
  notifyAdmin: jest.fn(),
}));

// Mock node-cron
jest.mock("node-cron", () => ({
  schedule: jest.fn(),
}));

import { notifyAdmin } from "../modules/maintenance/services/notification.service";

const sampleMaintenanceRule = {
  _id: "507f1f77bcf86cd799439020",
  resourceType: "truck" as const,
  resourceId: sampleTruck._id,
  intervalKm: 10000,
  intervalDays: 30,
  description: "Oil change",
  lastRun: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
};

describe("MaintenanceService", () => {
  let service: MaintenanceService;
  let mockMaintenanceRepo: ReturnType<typeof createMockRepository>;
  let mockTruckRepo: ReturnType<typeof createMockTruckRepository>;
  let mockTrailerRepo: ReturnType<typeof createMockRepository>;
  let mockTireRepo: ReturnType<typeof createMockRepository>;

  beforeEach(() => {
    mockMaintenanceRepo = createMockRepository();
    mockTruckRepo = createMockTruckRepository();
    mockTrailerRepo = createMockRepository();
    mockTireRepo = createMockRepository();
    
    service = new MaintenanceService(
      mockMaintenanceRepo as any,
      mockTruckRepo as any,
      mockTrailerRepo as any,
      mockTireRepo as any
    );
    jest.clearAllMocks();
  });

  describe("getAllMaintenace", () => {
    it("should return all maintenance rules", async () => {
      mockMaintenanceRepo.find.mockResolvedValue([sampleMaintenanceRule]);

      const result = await service.getAllMaintenace();

      expect(mockMaintenanceRepo.find).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it("should accept filter", async () => {
      mockMaintenanceRepo.find.mockResolvedValue([]);
      const filter = { resourceType: "truck" };

      await service.getAllMaintenace(filter);

      expect(mockMaintenanceRepo.find).toHaveBeenCalledWith(filter);
    });
  });

  describe("getMaintencance", () => {
    it("should return maintenance rule if found", async () => {
      mockMaintenanceRepo.findById.mockResolvedValue(sampleMaintenanceRule);

      const result = await service.getMaintencance(sampleMaintenanceRule._id);

      expect(mockMaintenanceRepo.findById).toHaveBeenCalledWith(sampleMaintenanceRule._id);
      expect(result._id).toBe(sampleMaintenanceRule._id);
    });

    it("should throw NotFoundError if not found", async () => {
      mockMaintenanceRepo.findById.mockResolvedValue(null);

      await expect(service.getMaintencance("nonexistent")).rejects.toThrow(NotFoundError);
      await expect(service.getMaintencance("nonexistent")).rejects.toThrow("Maintenance not found");
    });
  });

  describe("createMaintenace", () => {
    const createDto = {
      resourceType: "truck",
      resourceId: sampleTruck._id,
      intervalKm: 15000,
      description: "Brake inspection",
    };

    it("should create maintenance rule successfully", async () => {
      mockMaintenanceRepo.create.mockResolvedValue({ ...sampleMaintenanceRule, ...createDto });

      const result = await service.createMaintenace(createDto);

      expect(mockMaintenanceRepo.create).toHaveBeenCalledWith(createDto);
      expect(result.intervalKm).toBe(createDto.intervalKm);
    });
  });

  describe("updateMaintenace", () => {
    const updateDto = { intervalKm: 20000 };

    it("should update maintenance rule successfully", async () => {
      mockMaintenanceRepo.findById.mockResolvedValue(sampleMaintenanceRule);
      mockMaintenanceRepo.update.mockResolvedValue({ ...sampleMaintenanceRule, ...updateDto });

      const result = await service.updateMaintenace(sampleMaintenanceRule._id, updateDto);

      expect(mockMaintenanceRepo.update).toHaveBeenCalledWith(sampleMaintenanceRule._id, updateDto);
      expect(result?.intervalKm).toBe(updateDto.intervalKm);
    });

    it("should throw NotFoundError if not found", async () => {
      mockMaintenanceRepo.findById.mockResolvedValue(null);

      await expect(service.updateMaintenace("nonexistent", updateDto)).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteMaintenace", () => {
    it("should delete maintenance rule successfully", async () => {
      mockMaintenanceRepo.findById.mockResolvedValue(sampleMaintenanceRule);
      mockMaintenanceRepo.delete.mockResolvedValue(true);

      await service.deleteMaintenace(sampleMaintenanceRule._id);

      expect(mockMaintenanceRepo.delete).toHaveBeenCalledWith(sampleMaintenanceRule._id);
    });

    it("should throw NotFoundError if not found", async () => {
      mockMaintenanceRepo.findById.mockResolvedValue(null);

      await expect(service.deleteMaintenace("nonexistent")).rejects.toThrow(NotFoundError);
    });
  });

  describe("checkAllRules", () => {
    it("should check all maintenance rules and notify for trucks over interval", async () => {
      const truckOverInterval = { ...sampleTruck, odometerKm: 60000 };
      const ruleWithHighInterval = { ...sampleMaintenanceRule, intervalKm: 50000 };
      
      mockMaintenanceRepo.find.mockResolvedValue([ruleWithHighInterval]);
      mockTruckRepo.findById.mockResolvedValue(truckOverInterval);

      await service.checkAllRules();

      expect(notifyAdmin).toHaveBeenCalledWith(
        expect.stringContaining("reached interval"),
        expect.objectContaining({ type: "truck" })
      );
    });

    it("should check trailer maintenance rules", async () => {
      const trailerRule = { ...sampleMaintenanceRule, resourceType: "trailer" as const };
      const trailerOverInterval = { plateNumber: "TRL-001", mileage: 60000 };
      
      mockMaintenanceRepo.find.mockResolvedValue([trailerRule]);
      mockTrailerRepo.findById.mockResolvedValue(trailerOverInterval);

      await service.checkAllRules();

      expect(mockTrailerRepo.findById).toHaveBeenCalled();
    });

    it("should check tire maintenance rules", async () => {
      const tireRule = { ...sampleMaintenanceRule, resourceType: "tire" as const };
      const tireOverInterval = { serialNumber: "TIR-001", wearLevel: 80 };
      
      mockMaintenanceRepo.find.mockResolvedValue([tireRule]);
      mockTireRepo.findById.mockResolvedValue(tireOverInterval);

      await service.checkAllRules();

      expect(mockTireRepo.findById).toHaveBeenCalled();
    });

    it("should check days interval and notify when due", async () => {
      const oldLastRun = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000); // 40 days ago
      const ruleWithDays = { 
        ...sampleMaintenanceRule, 
        intervalDays: 30, 
        lastRun: oldLastRun,
        intervalKm: undefined 
      };
      
      mockMaintenanceRepo.find.mockResolvedValue([ruleWithDays]);
      mockTruckRepo.findById.mockResolvedValue(sampleTruck);

      await service.checkAllRules();

      expect(notifyAdmin).toHaveBeenCalledWith(
        expect.stringContaining("due by days interval"),
        expect.any(Object)
      );
    });

    it("should skip if asset not found", async () => {
      mockMaintenanceRepo.find.mockResolvedValue([sampleMaintenanceRule]);
      mockTruckRepo.findById.mockResolvedValue(null);

      await service.checkAllRules();

      expect(notifyAdmin).not.toHaveBeenCalled();
    });
  });
});
