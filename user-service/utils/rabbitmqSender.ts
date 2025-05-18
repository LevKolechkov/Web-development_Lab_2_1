import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
const EXCHANGE_NAME = process.env.EXCHANGE_NAME || "app-exchange";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const startListeningRabbitMQ = async (
  queue: string,
  routingKey: string
) => {
  let retries = 10;

  while (retries > 0) {
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();

      await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });
      await channel.assertQueue(queue, { durable: true });
      await channel.bindQueue(queue, EXCHANGE_NAME, routingKey);

      console.log(
        `Waiting for messages from queue: "${queue}", routingKey: "${routingKey}"`
      );

      channel.consume(queue, (msg) => {
        if (msg) {
          const content = JSON.parse(msg.content.toString());
          console.log(`Received:`, content);
          channel.ack(msg);
        }
      });

      return;
    } catch (err) {
      console.error(err);
      retries--;
      await wait(5000);
    }
  }

  console.error("Failed to connect to RabbitMQ after multiple attempts.");
};
