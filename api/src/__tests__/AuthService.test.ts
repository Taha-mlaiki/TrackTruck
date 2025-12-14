// Mock config BEFORE importing AuthService
jest.mock("../config", () => ({
  __esModule: true,
  default: {
    JWT_SECRET: "test-jwt-secret-key",
    JWT_EXPIRES_IN: "15m",
    JWT_REFRESH_SECRET: "test-refresh-secret-key",
    JWT_REFRESH_EXPIRES_IN: "7d",
  },
}));

// Mock password utility
jest.mock("../utils/password.util", () => ({
  comparPwd: jest.fn().mockResolvedValue(true),
}));

import { AuthService } from "../modules/auth/AuthService";
import { 
  createMockUserRepository, 
  sampleUser
} from "./helpers/mocks";
import { NotFoundError } from "../errors/NotFoundError";
import { AppError } from "../errors/AppError";
import jwt from "jsonwebtoken";

import * as passwordUtil from "../utils/password.util";

describe("AuthService", () => {
  let service: AuthService;
  let mockRepo: ReturnType<typeof createMockUserRepository>;

  beforeEach(() => {
    mockRepo = createMockUserRepository();
    service = new AuthService(mockRepo as any);
    jest.clearAllMocks();
  });

  describe("generateTokens", () => {
    it("should generate access and refresh tokens", () => {
      const user = { id: sampleUser._id, role: "Driver", email: sampleUser.email };

      const tokens = service.generateTokens(user);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(typeof tokens.accessToken).toBe("string");
      expect(typeof tokens.refreshToken).toBe("string");
    });

    it("should create valid JWT tokens", () => {
      const user = { id: sampleUser._id, role: "Driver", email: sampleUser.email };

      const tokens = service.generateTokens(user);

      const decoded = jwt.verify(tokens.accessToken, "test-jwt-secret-key") as any;
      expect(decoded.sub).toBe(user.id);
      expect(decoded.role).toBe(user.role);
      expect(decoded.email).toBe(user.email);
    });
  });

  describe("login", () => {
    const email = "test@example.com";
    const password = "password123";

    it("should login successfully with correct credentials", async () => {
      mockRepo.findByEmail.mockResolvedValue({ 
        ...sampleUser, 
        id: sampleUser._id,
        password: "hashedpassword" 
      });
      (passwordUtil.comparPwd as jest.Mock).mockResolvedValue(true);

      const result = await service.login(email, password);

      expect(mockRepo.findByEmail).toHaveBeenCalledWith(email);
      expect(passwordUtil.comparPwd).toHaveBeenCalledWith(password, "hashedpassword");
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user).toBeDefined();
    });

    it("should throw NotFoundError if user not found", async () => {
      mockRepo.findByEmail.mockResolvedValue(null);

      await expect(service.login(email, password)).rejects.toThrow(NotFoundError);
      await expect(service.login(email, password)).rejects.toThrow("User not found");
    });

    it("should throw AppError if password is incorrect", async () => {
      mockRepo.findByEmail.mockResolvedValue({ 
        ...sampleUser, 
        password: "hashedpassword" 
      });
      (passwordUtil.comparPwd as jest.Mock).mockResolvedValue(false);

      await expect(service.login(email, password)).rejects.toThrow(AppError);
      await expect(service.login(email, password)).rejects.toThrow("Invalid credentials");
    });
  });

  describe("refreshTokens", () => {
    it("should refresh tokens with valid refresh token", async () => {
      const user = { id: sampleUser._id, role: "Driver", email: sampleUser.email };
      const validRefreshToken = jwt.sign(
        { sub: user.id, role: user.role, email: user.email },
        "test-refresh-secret-key"
      );
      mockRepo.findById.mockResolvedValue({ ...sampleUser, id: sampleUser._id });

      const result = await service.refreshTokens(validRefreshToken);

      expect(mockRepo.findById).toHaveBeenCalledWith(user.id);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it("should throw AppError with invalid refresh token", async () => {
      await expect(service.refreshTokens("invalid-token")).rejects.toThrow(AppError);
      await expect(service.refreshTokens("invalid-token")).rejects.toThrow("Invalid refresh token");
    });

    it("should throw AppError if user not found", async () => {
      const validRefreshToken = jwt.sign(
        { sub: "nonexistent", role: "Driver", email: "test@test.com" },
        "test-refresh-secret-key"
      );
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.refreshTokens(validRefreshToken)).rejects.toThrow(AppError);
    });
  });

  describe("getUserFromToken", () => {
    it("should return user with valid access token", async () => {
      const user = { id: sampleUser._id, role: "Driver", email: sampleUser.email };
      const validAccessToken = jwt.sign(
        { sub: user.id, role: user.role, email: user.email },
        "test-jwt-secret-key"
      );
      mockRepo.findById.mockResolvedValue({ ...sampleUser, id: sampleUser._id });

      const result = await service.getUserFromToken(validAccessToken);

      expect(mockRepo.findById).toHaveBeenCalledWith(user.id);
      expect(result._id).toBe(sampleUser._id);
    });

    it("should throw AppError with invalid token", async () => {
      await expect(service.getUserFromToken("invalid-token")).rejects.toThrow(AppError);
      await expect(service.getUserFromToken("invalid-token")).rejects.toThrow("Invalid token");
    });

    it("should throw AppError if user not found", async () => {
      const validAccessToken = jwt.sign(
        { sub: "nonexistent", role: "Driver", email: "test@test.com" },
        "test-jwt-secret-key"
      );
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.getUserFromToken(validAccessToken)).rejects.toThrow(AppError);
    });
  });
});
