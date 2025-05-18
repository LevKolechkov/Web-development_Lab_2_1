import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
const EXCHANGE_NAME = process.env.EXCHANGE_NAME || "app-exchange";

const queues = [
  { queue: "user-service", routingKey: "user-service-routing" },
  { queue: "course-service", routingKey: "course-service-routing" },
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const initQueues = async () => {
  let retries = 10;

  while (retries > 0) {
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();

      await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });

      for (const { queue, routingKey } of queues) {
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, EXCHANGE_NAME, routingKey);
        console.log(
          `Queue ${queue} bound to ${EXCHANGE_NAME} with key "${routingKey}"`
        );
      }

      await channel.close();
      await connection.close();
      return;
    } catch (err) {
      console.error(err);
      retries--;
      await wait(5000);
    }
  }

  console.error("Failed to connect to RabbitMQ after multiple attempts.");
};
