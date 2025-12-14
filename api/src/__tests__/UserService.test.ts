import { UserService } from "../modules/users/UserService";
import { 
  createMockUserRepository, 
  sampleUser, 
  sampleAdmin 
} from "./helpers/mocks";
import { AppError } from "../errors/AppError";
import * as passwordUtil from "../utils/password.util";

// Mock the password utility
jest.mock("../utils/password.util", () => ({
  hashPassword: jest.fn().mockResolvedValue("hashedpassword"),
  comparePassword: jest.fn().mockResolvedValue(true),
}));

describe("UserService", () => {
  let service: UserService;
  let mockRepo: ReturnType<typeof createMockUserRepository>;

  beforeEach(() => {
    mockRepo = createMockUserRepository();
    service = new UserService(mockRepo as any);
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    const createUserDto = {
      name: "New User",
      email: "newuser@example.com",
      password: "password123",
      role: "Driver" as const,
    };

    it("should create a new user successfully", async () => {
      mockRepo.findByEmail.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue({ ...sampleUser, ...createUserDto });

      const result = await service.createUser(createUserDto);

      expect(mockRepo.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(passwordUtil.hashPassword).toHaveBeenCalledWith(createUserDto.password);
      expect(mockRepo.create).toHaveBeenCalled();
      expect(result.email).toBe(createUserDto.email);
    });

    it("should throw error if email already exists", async () => {
      mockRepo.findByEmail.mockResolvedValue(sampleUser);

      await expect(service.createUser(createUserDto)).rejects.toThrow(AppError);
      await expect(service.createUser(createUserDto)).rejects.toThrow("Email already in use");
    });
  });

  describe("listUsers", () => {
    it("should return all users", async () => {
      mockRepo.list.mockResolvedValue([sampleUser, sampleAdmin]);

      const result = await service.listUsers();

      expect(mockRepo.list).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });
  });

  describe("getUserById", () => {
    it("should return user if found", async () => {
      mockRepo.findById.mockResolvedValue(sampleUser);

      const result = await service.getUserById(sampleUser._id);

      expect(mockRepo.findById).toHaveBeenCalledWith(sampleUser._id);
      expect(result._id).toBe(sampleUser._id);
    });

    it("should throw AppError if user not found", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.getUserById("nonexistent")).rejects.toThrow(AppError);
      await expect(service.getUserById("nonexistent")).rejects.toThrow("User not found");
    });
  });

  describe("updateUser", () => {
    const updateDto = { name: "Updated Name" };

    it("should update user successfully", async () => {
      mockRepo.update.mockResolvedValue({ ...sampleUser, ...updateDto });

      const result = await service.updateUser(sampleUser._id, updateDto);

      expect(mockRepo.update).toHaveBeenCalledWith(sampleUser._id, updateDto);
      expect(result.name).toBe(updateDto.name);
    });

    it("should throw AppError if user not found", async () => {
      mockRepo.update.mockResolvedValue(null);

      await expect(service.updateUser("nonexistent", updateDto)).rejects.toThrow(AppError);
      await expect(service.updateUser("nonexistent", updateDto)).rejects.toThrow("User not Updated");
    });
  });
});
