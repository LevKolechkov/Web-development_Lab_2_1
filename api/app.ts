import express, { Express } from "express";
import rootRouter from "./routes/indexRoute";
import { initQueues } from "./utils/initQueues";

const app: Express = express();
const PORT: string | number = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", rootRouter);

initQueues().then(() => {
  app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
  });
});
