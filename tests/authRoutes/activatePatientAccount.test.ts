import { api } from "../../src/testConfig";
import { EnumStatusCode } from "../../src/enums/status-codes";
import { IUserDocument, UserModel } from "../../src/models/user";
import { CreateUserDto } from "../../src/dto/input/patient";

describe("Auth API Routes - Activate patient's account", () => {
  describe("GET /api/auth/v1/activate/patient", () => {
    it("should activate a patient's account successfully with a valid token", async () => {
      const userData: CreateUserDto = {
        name: "Jane Patient",
        email: "janepatient@example.com",
        password: "SecurePass123!",
      };

      // Create user (generates activationToken)
      await api.post("/api/auth/v1").send(userData);

      // Retrieve created user & token
      const user: IUserDocument | null = await UserModel.findOne({
        email: userData.email,
      });
      expect(user).toBeTruthy();
      const token = user?.activationToken;
      expect(token).toBeTruthy();

      // Call activation endpoint
      const res = await api
        .get("/api/auth/v1/activate/patient")
        .query({ token });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(EnumStatusCode.UPDATED_SUCCESSFULLY);

      // Validate changes in database
      const updatedUser = await UserModel.findById(user?._id);
      expect(updatedUser?.isActive).toBe(true);
      expect(updatedUser?.activationToken).toBeNull();
    });

    it("should return 400 when token is missing", async () => {
      const res = await api.get("/api/auth/v1/activate/patient");
      expect(res.status).toBe(400);
      expect(res.body.code).toBe(EnumStatusCode.VALIDATION_ERROR);
    });

    it("should return 401 for an invalid token", async () => {
      const res = await api
        .get("/api/auth/v1/activate/patient")
        .query({ token: "invalidtoken" });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe(EnumStatusCode.UNAUTHORIZED);
    });
  });
});
