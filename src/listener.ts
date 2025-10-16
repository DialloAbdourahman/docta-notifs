import amqp from "amqplib";
import { config } from "./config";
import { UserEventsHandler } from "./events/user-events-handler";
import { PatientCreatedEvent, RoutingKey } from "docta-package";

interface ListenerOption {
  exchange: string;
  queue: string;
  routingKeys: string[];
}

export async function listenToQueue({
  exchange,
  queue,
  routingKeys,
}: ListenerOption) {
  try {
    const connection = await amqp.connect(config.rabbitmqHost);
    const channel = await connection.createChannel();

    await channel.assertExchange(exchange, "topic", { durable: true });
    await channel.assertQueue(queue, { durable: true });

    // Bind queue to each routing key
    for (const key of routingKeys) {
      await channel.bindQueue(queue, exchange, key);
      console.log(`✅ Bound queue "${queue}" to routing key "${key}"`);
    }

    console.log(
      `🎧 Listening on "${queue}" for routing keys: [${routingKeys.join(", ")}]`
    );

    await channel.consume(
      queue,
      async (msg) => {
        if (!msg) return;

        const routingKey = msg.fields.routingKey;
        const content = msg.content.toString();

        try {
          const data = JSON.parse(content);

          // Handle messages based on routing key
          switch (routingKey) {
            case RoutingKey.PATIENT_CREATED:
              await UserEventsHandler.patientCreatedHandler(
                data as PatientCreatedEvent
              );
              break;

            // case "user.updated":
            //   console.log("✏️ User updated:", data);
            //   break;

            // case "user.deleted":
            //   console.log("🗑️ User deleted:", data);
            //   break;

            default:
              console.warn("⚠️ Unhandled routing key:", routingKey, data);
          }

          channel.ack(msg);
        } catch (err) {
          console.error("❌ Failed to process message:", err);
          //   channel.nack(msg, false, true);
          channel.nack(msg, false, false);
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("Error setting up listener:", error);
  }
}
