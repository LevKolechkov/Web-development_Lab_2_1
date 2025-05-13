import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";

export const startListeningRabbitMQ = async (
  queue: string,
  routingKey: string
) => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.bindQueue(queue, "app-exchange", routingKey);

    console.log(`Waiting for messages from ${queue}`);

    channel.consume(queue, (msg) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        console.log(`Received message: ${JSON.stringify(content)}`);

        channel.ack(msg);
      } else {
        console.error("Received an empty message");
      }
    });

    channel.on("error", (err) => {
      console.error("Channel error:", err);
    });
  } catch (error) {
    console.error("Error in recieving message from RabbitMQ:", error);
  }
};
