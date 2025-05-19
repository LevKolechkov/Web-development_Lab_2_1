import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
const EXCHANGE_NAME = process.env.EXCHANGE_NAME || "app-exchange";

export const sendToQueue = async (
  queue: string,
  routingKey: string,
  message: string
) => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });
    await channel.assertQueue(queue, {
      durable: true,
    });

    await channel.bindQueue(queue, EXCHANGE_NAME, routingKey);

    channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(message));

    console.log(`Sent message to ${queue}: ${message}`);

    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error("Error in sending to RabbitMQ:", error);
  }
};
