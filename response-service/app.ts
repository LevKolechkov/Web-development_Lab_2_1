import express, { Express } from "express";
import mongoose from "mongoose";
import responseRouter from "./routes/responseRoute";
import { initQueues } from "./utils/initQueues";
import { startListeningRabbitMQ } from "./utils/rabbitmqReciever";

const app: Express = express();
const PORT: string | number = process.env.PORT || 5000;
const MONGO_URL: string =
  process.env.MONGO_URL ||
  "mongodb://root:example@mongo:27017/lab_1?authSource=admin";

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    startListeningRabbitMQ("response-service", "response-service-routing");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.use(express.json());
app.use("/", responseRouter);

initQueues().then(() => {
  app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
  });
});
