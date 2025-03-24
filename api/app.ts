import express, { Express } from "express";
import rootRouter from "./routes/indexRoute";
import mongoose from "mongoose";

const app: Express = express();
const PORT: string | number = process.env.PORT || 5000;
const MONGO_URL: string =
  process.env.MONGO_URL ||
  "mongodb://root:example@localhost:27017/lab_1?authSource=admin";

app.use(express.json());

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

app.use("/", rootRouter);

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
