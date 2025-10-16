import { PatientCreatedEvent } from "docta-package";

export class UserEventsHandler {
  public static patientCreatedHandler = async (data: PatientCreatedEvent) => {
    console.log("Patient created:", data);
  };
}
