import { TripService } from "../modules/trips/TripService";
import { 
  createMockRepository, 
  createMockUserRepository, 
  createMockTruckRepository,
  createMockPdfService,
  sampleUser, 
  sampleTruck, 
  sampleTrip,
  sampleAdmin
} from "./helpers/mocks";
import { NotFoundError } from "../errors/NotFoundError";
import { AppError } from "../errors/AppError";

describe("TripService", () => {
  let service: TripService;
  let mockTripRepo: ReturnType<typeof createMockRepository>;
  let mockUserRepo: ReturnType<typeof createMockUserRepository>;
  let mockTruckRepo: ReturnType<typeof createMockTruckRepository>;
  let mockPdfService: ReturnType<typeof createMockPdfService>;

  beforeEach(() => {
    mockTripRepo = createMockRepository();
    mockUserRepo = createMockUserRepository();
    mockTruckRepo = createMockTruckRepository();
    mockPdfService = createMockPdfService();
    
    service = new TripService(
      mockTripRepo as any,
      mockUserRepo as any,
      mockTruckRepo as any,
      mockPdfService as any
    );
    jest.clearAllMocks();
  });

  describe("createTrip", () => {
    const createTripDto = {
      reference: "TRP-002",
      origin: "Marrakech",
      destination: "Fes",
      plannedStart: new Date().toISOString(),
      driverId: sampleUser._id,
      truckId: sampleTruck._id,
    };

    it("should create trip successfully", async () => {
      mockUserRepo.findById.mockResolvedValue({ ...sampleUser, role: "Driver" });
      mockTruckRepo.findById.mockResolvedValue({ ...sampleTruck, assignedTo: null });
      mockTripRepo.create.mockResolvedValue({ ...sampleTrip, ...createTripDto });
      mockTruckRepo.update.mockResolvedValue(sampleTruck);

      const result = await service.createTrip(createTripDto);

      expect(mockUserRepo.findById).toHaveBeenCalledWith(createTripDto.driverId);
      expect(mockTruckRepo.findById).toHaveBeenCalledWith(createTripDto.truckId);
      expect(mockTripRepo.create).toHaveBeenCalled();
      expect(mockTruckRepo.update).toHaveBeenCalled();
      expect(result.origin).toBe(createTripDto.origin);
    });

    it("should throw NotFoundError if driver not found", async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(service.createTrip(createTripDto)).rejects.toThrow(NotFoundError);
      await expect(service.createTrip(createTripDto)).rejects.toThrow("Driver not found");
    });

    it("should throw AppError if user is not a driver", async () => {
      mockUserRepo.findById.mockResolvedValue({ ...sampleUser, role: "Admin" });

      await expect(service.createTrip(createTripDto)).rejects.toThrow(AppError);
      await expect(service.createTrip(createTripDto)).rejects.toThrow("not a driver");
    });

    it("should throw NotFoundError if truck not found", async () => {
      mockUserRepo.findById.mockResolvedValue({ ...sampleUser, role: "Driver" });
      mockTruckRepo.findById.mockResolvedValue(null);

      await expect(service.createTrip(createTripDto)).rejects.toThrow(NotFoundError);
      await expect(service.createTrip(createTripDto)).rejects.toThrow("Truck not found");
    });

    it("should throw AppError if truck already assigned", async () => {
      mockUserRepo.findById.mockResolvedValue({ ...sampleUser, role: "Driver" });
      mockTruckRepo.findById.mockResolvedValue({ ...sampleTruck, assignedTo: "someone" });

      await expect(service.createTrip(createTripDto)).rejects.toThrow(AppError);
      await expect(service.createTrip(createTripDto)).rejects.toThrow("already assigned");
    });
  });

  describe("updateStatus", () => {
    it("should update status to in_progress", async () => {
      const trip = { ...sampleTrip, status: "pending" };
      mockTripRepo.findById.mockResolvedValue(trip);
      mockTripRepo.update.mockResolvedValue({ ...trip, status: "in_progress" });

      const result = await service.updateStatus(trip._id, "in_progress", {});

      expect(mockTripRepo.update).toHaveBeenCalledWith(trip._id, expect.objectContaining({ status: "in_progress" }));
    });

    it("should throw NotFoundError if trip not found", async () => {
      mockTripRepo.findById.mockResolvedValue(null);

      await expect(service.updateStatus("nonexistent", "in_progress", {})).rejects.toThrow(NotFoundError);
    });

    it("should require endOdometer when completing trip", async () => {
      const trip = { ...sampleTrip, status: "in_progress", startOdometer: 50000 };
      mockTripRepo.findById.mockResolvedValue(trip);

      await expect(
        service.updateStatus(trip._id, "completed", {})
      ).rejects.toThrow(AppError);
      await expect(
        service.updateStatus(trip._id, "completed", {})
      ).rejects.toThrow("endOdometer required");
    });

    it("should update truck odometer when completing trip", async () => {
      const trip = { ...sampleTrip, status: "in_progress", startOdometer: 50000, truck: { _id: sampleTruck._id } };
      mockTripRepo.findById.mockResolvedValue(trip);
      mockTripRepo.update.mockResolvedValue({ ...trip, status: "completed" });
      mockTruckRepo.update.mockResolvedValue(sampleTruck);

      await service.updateStatus(trip._id, "completed", { endOdometer: 50500 });

      expect(mockTruckRepo.update).toHaveBeenCalledWith(sampleTruck._id, { odometerKm: 50500 });
    });

    it("should check ownership for non-admin users", async () => {
      const trip = { ...sampleTrip, driver: { _id: "different-driver" } };
      mockTripRepo.findById.mockResolvedValue(trip);

      await expect(
        service.updateStatus(trip._id, "in_progress", {}, sampleUser._id, "Driver")
      ).rejects.toThrow(AppError);
      await expect(
        service.updateStatus(trip._id, "in_progress", {}, sampleUser._id, "Driver")
      ).rejects.toThrow("your own trips");
    });

    it("should allow admin to update any trip", async () => {
      const trip = { ...sampleTrip, driver: { _id: "different-driver" } };
      mockTripRepo.findById.mockResolvedValue(trip);
      mockTripRepo.update.mockResolvedValue({ ...trip, status: "in_progress" });

      const result = await service.updateStatus(trip._id, "in_progress", {}, sampleAdmin._id, "Admin");

      expect(mockTripRepo.update).toHaveBeenCalled();
    });
  });

  describe("listForUser", () => {
    it("should return all trips for admin", async () => {
      mockTripRepo.find.mockResolvedValue([sampleTrip]);

      await service.listForUser(sampleAdmin._id, "Admin");

      expect(mockTripRepo.find).toHaveBeenCalledWith();
    });

    it("should filter trips by driver for non-admin", async () => {
      mockTripRepo.find.mockResolvedValue([sampleTrip]);

      await service.listForUser(sampleUser._id, "Driver");

      expect(mockTripRepo.find).toHaveBeenCalledWith({ driver: sampleUser._id });
    });
  });

  describe("generateTripPdf", () => {
    it("should generate PDF successfully", async () => {
      mockTripRepo.findById.mockResolvedValue(sampleTrip);

      const result = await service.generateTripPdf(sampleTrip._id);

      expect(mockPdfService.generateTripPdfBuffer).toHaveBeenCalledWith(sampleTrip);
      expect(result).toBeInstanceOf(Buffer);
    });

    it("should throw NotFoundError if trip not found", async () => {
      mockTripRepo.findById.mockResolvedValue(null);

      await expect(service.generateTripPdf("nonexistent")).rejects.toThrow(NotFoundError);
    });

    it("should check ownership for non-admin users", async () => {
      const trip = { ...sampleTrip, driver: { _id: "different-driver" } };
      mockTripRepo.findById.mockResolvedValue(trip);

      await expect(
        service.generateTripPdf(trip._id, sampleUser._id, "Driver")
      ).rejects.toThrow(AppError);
      await expect(
        service.generateTripPdf(trip._id, sampleUser._id, "Driver")
      ).rejects.toThrow("your own trip PDFs");
    });
  });
});
