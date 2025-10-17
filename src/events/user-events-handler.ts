import { PatientCreatedEvent } from "docta-package";
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
}
