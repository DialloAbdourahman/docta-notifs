import { api } from "../../src/testConfig";
import { EnumStatusCode } from "../../src/enums/status-codes";
import { EnumUserRole, IUserDocument, UserModel } from "../../src/models/user";
import { IPatientDocument, PatientModel } from "../../src/models/patient";
import { CreateUserDto } from "../../src/dto/input/patient";

describe("Auth API Routes - Create Patient", () => {
  describe("POST /api/auth/v1", () => {
    it("should create a new user and patient successfully with proper data", async () => {
      const userData: CreateUserDto = {
        name: "John Patient",
        email: "johnpatient@example.com",
        password: "securePass123!",
      };

      const res = await api.post("/api/auth/v1").send(userData);

      // Verify API response
      expect(res.status).toBe(201);
      expect(res.body.code).toBe(EnumStatusCode.CREATED_SUCCESSFULLY);

      // Verify user creation in database
      const user: IUserDocument | null = await UserModel.findOne({
        email: userData.email,
      });
      expect(user).toBeTruthy();
      expect(user?.name).toBe(userData.name);
      expect(user?.email).toBe(userData.email);
      expect(user?.role).toBe(EnumUserRole.PATIENT);
      expect(user?.activationToken).toBeTruthy();
      expect(user?.isActive).toBe(false);

      // Verify patient creation and linking
      const patient: IPatientDocument | null = await PatientModel.findOne({
        user: user?._id,
      });
      expect(patient).toBeTruthy();
      expect(patient?.user?.toString()).toBe(user?._id?.toString());
    });

    describe("Validation Tests", () => {
      it("should validate name field", async () => {
        const res = await api.post("/api/auth/v1").send({
          name: "",
          email: "valid@example.com",
          password: "securePass123!",
        });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe(EnumStatusCode.VALIDATION_ERROR);
        expect(res.body.message).toBeDefined();
      });

      it("should validate email format", async () => {
        const res = await api.post("/api/auth/v1").send({
          name: "John Test",
          email: "invalid-email",
          password: "securePass123!",
        });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe(EnumStatusCode.VALIDATION_ERROR);
      });

      it("should validate password strength", async () => {
        const res = await api.post("/api/auth/v1").send({
          name: "John Test",
          email: "valid@example.com",
          password: "123", // Too short
        });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe(EnumStatusCode.VALIDATION_ERROR);
      });
    });

    it("should prevent duplicate email registration", async () => {
      const userData = {
        name: "John Duplicate",
        email: "duplicate@example.com",
        password: "securePass123!",
      };

      // First registration
      await api.post("/api/auth/v1").send(userData);

      // Attempt duplicate registration
      const res = await api.post("/api/auth/v1").send(userData);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(EnumStatusCode.EXISTS_ALREADY);
    });
  });
});
