import "reflect-metadata";
import { config } from "./config";
import mongoose from "mongoose";
import {
  Exchanges,
  RoutingKey,
  LoggedInUserTokenData,
  Queues,
} from "docta-package";
import { listenToQueue } from "./listener";

declare global {
  namespace Express {
    interface Request {
      currentUser?: LoggedInUserTokenData;
    }
  }
}

const start = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("MongoDB connected");
    console.log("Registered models:", mongoose.modelNames());

    await listenToQueue({
      exchange: Exchanges.DOCTA_EXCHANGE,
      queue: Queues.NOTIFICATIONS_QUEUE,
      routingKeys: [RoutingKey.PATIENT_CREATED],
    });

    process.on("SIGINT", async () => {
      console.log("Gracefully shutting down...");
      await mongoose.disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

start();

// Start looking at the email service with ses and sqs.
// Sudo systemctl start rabbitmq-server # Start the service if not running
