import { api } from "../../src/testConfig";
import { EnumStatusCode } from "../../src/enums/status-codes";
import { EnumUserRole, IUserDocument, UserModel } from "../../src/models/user";
import { IDoctorDocument, DoctorModel } from "../../src/models/doctor";
import { CreateDoctorDto } from "../../src/dto/input/doctor";
import { SpecialtyModel } from "../../src/models/specialty";

describe("Auth API Routes - Create Doctor", () => {
  describe("POST /api/auth/v1/admin/doctors", () => {
    it("should create a new doctor successfully with proper data", async () => {
      const specialty = await SpecialtyModel.create({
        name: "Cardiology",
      });

      const doctorData: CreateDoctorDto = {
        name: "Dr. Jane Smith",
        email: "jane.smith@example.com",
        specialtyId: specialty.id.toString(), // Sample MongoDB ID
        biography: "Experienced cardiologist with 10+ years of practice.",
      };

      const res = await api.post("/api/auth/v1/admin/doctors").send(doctorData);

      // Verify API response
      expect(res.status).toBe(201);
      expect(res.body.code).toBe(EnumStatusCode.CREATED_SUCCESSFULLY);

      // Verify user creation in database
      const user: IUserDocument | null = await UserModel.findOne({
        email: doctorData.email,
      });
      expect(user).toBeTruthy();
      expect(user?.name).toBe(doctorData.name);
      expect(user?.email).toBe(doctorData.email);
      expect(user?.role).toBe(EnumUserRole.DOCTOR);
      expect(user?.activationToken).toBeTruthy();
      expect(user?.isActive).toBe(false);

      // Verify doctor creation and linking
      const doctor: IDoctorDocument | null = await DoctorModel.findOne({
        user: user?._id,
      });
      expect(doctor).toBeTruthy();
      expect(doctor?.user?.toString()).toBe(user?._id?.toString());
      // expect(doctor?.specialtyId.toString()).toBe(doctorData.specialtyId); // TODO: UNCOMMENT THIS
      expect(doctor?.biography).toBe(doctorData.biography);
      expect(doctor?.isActive).toBe(false);
    });

    describe("Validation Tests", () => {
      it("should validate name field", async () => {
        const res = await api.post("/api/auth/v1/admin/doctors").send({
          name: "",
          email: "valid@example.com",
          specialtyId: "507f1f77bcf86cd799439011",
        });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe(EnumStatusCode.VALIDATION_ERROR);
      });

      it("should validate email format", async () => {
        const res = await api.post("/api/auth/v1/admin/doctors").send({
          name: "Dr. John Doe",
          email: "invalid-email",
          specialtyId: "507f1f77bcf86cd799439011",
        });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe(EnumStatusCode.VALIDATION_ERROR);
      });

      it("should validate specialtyId is provided", async () => {
        const res = await api.post("/api/auth/v1/admin/doctors").send({
          name: "Dr. John Doe",
          email: "john.doe@example.com",
          // Missing specialtyId
        });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe(EnumStatusCode.VALIDATION_ERROR);
      });
    });

    it("should not allow duplicate email addresses", async () => {
      const specialty = await SpecialtyModel.create({
        name: "Cardiology",
      });

      const doctorData: CreateDoctorDto = {
        name: "Dr. John Doe",
        email: "john.doe@example.com",
        specialtyId: specialty.id.toString(),
      };

      // First request should succeed
      await api.post("/api/auth/v1/admin/doctors").send(doctorData);

      // Second request with same email should fail
      const res = await api.post("/api/auth/v1/admin/doctors").send(doctorData);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(EnumStatusCode.EXISTS_ALREADY);
    });
  });
});
