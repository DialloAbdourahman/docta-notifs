import {
  DoctorCreatedEvent,
  ForgotPasswordEvent,
  PatientCreatedEvent,
} from "docta-package";
import { AwsSesHelper } from "docta-package";
import { config } from "../config";
import ejs from "ejs";
import path from "path";

export class UserEventsHandler {
  public static patientCreatedHandler = async (data: PatientCreatedEvent) => {
    console.log("Patient created event received:", data);
    const awsSesHelper = new AwsSesHelper();

    const activationUrl = `https://example.com/activate?token=${encodeURIComponent(data.token)}`;

    const templatePath = path.join(
      __dirname,
      "../templates/patient-created.ejs"
    );

    const html = await ejs.renderFile(templatePath, {
      fullName: data.fullName,
      activationUrl,
    });

    await awsSesHelper.sendEmail({
      receiver: data.email,
      sender: config.awsSesSenderEmail,
      html,
      subject: "Activate your DOCTA account",
    });

    console.log("Email sent successfully");
  };

  public static doctorCreatedHandler = async (data: DoctorCreatedEvent) => {
    console.log("Doctor created event received:", data);
    const awsSesHelper = new AwsSesHelper();

    const activationUrl = `https://example.com/activate?token=${encodeURIComponent(data.token)}`;

    const templatePath = path.join(
      __dirname,
      "../templates/doctor.created.ejs"
    );

    const html = await ejs.renderFile(templatePath, {
      fullName: data.fullName,
      activationUrl,
    });

    await awsSesHelper.sendEmail({
      receiver: data.email,
      sender: config.awsSesSenderEmail,
      html,
      subject: "Activate and login to your DOCTA account",
    });

    console.log("Email sent successfully");
  };

  public static forgotPasswordHandler = async (data: ForgotPasswordEvent) => {
    console.log("Forgot password event received:", data);
    const awsSesHelper = new AwsSesHelper();

    const resetPasswordUrl = `https://example.com/activate?token=${encodeURIComponent(data.token)}`;

    const templatePath = path.join(
      __dirname,
      "../templates/forgot.password.ejs"
    );

    const html = await ejs.renderFile(templatePath, {
      fullName: data.fullName,
      resetPasswordUrl,
    });

    await awsSesHelper.sendEmail({
      receiver: data.email,
      sender: config.awsSesSenderEmail,
      html,
      subject: "Activate your DOCTA account",
    });

    console.log("Email sent successfully");
  };
}
