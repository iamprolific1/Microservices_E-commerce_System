import amqp, { Channel, Connection, ConsumeMessage } from "amqplib";

let connection: Connection | null = null;
let channel: Channel | null = null;

/**
 *  Connect to Rabbit MQ
 */

export const connectRabbitMQ = async (): Promise<void> => {
  try {
    connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();
    console.log("Connected to RabbitMQ");
  } catch (error) {
    console.error("Error connecting to RabbitMQ server: ", error);
    throw error;
  }
};

/**
 *  Publish a message to a queue
 *  @param queue - The name of the queue
 *  @param message - The name of the message
 */

export const publishMessage = async (
  queue: string,
  message: Record<string, unknown>
): Promise<void> => {
  try {
    if (!channel) throw new Error("RabbitMQ channel is not initialized");
    await channel.assertQueue(queue);
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    console.log(`message sent to queue "${queue}": `, message);
  } catch (error) {
    console.error("Error publishing message: ", error);
    throw error;
  }
};

/**
 *  consume messages from a queue
 *  @param queue - The name of the queue
 *  @param callback - Function to handle incoming messages
 */

export const consumeMessage = async (
  queue: string,
  callback: (message: Record<string, unknown>) => void
): Promise<void> => {
  try {
    if (!channel) throw new Error("RabbitMQ is not initialized");
    await channel.assertQueue(queue);
    channel.consume(queue, (msg: ConsumeMessage | null) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        callback(content);
        channel?.ack(msg); // acknowledge message
      }
    });
    console.log(`Listening to queue: "${queue}"`);
  } catch (error) {
    console.error("Error consuming message: ", error);
    throw error;
  }
};
