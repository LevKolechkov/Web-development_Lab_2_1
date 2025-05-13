import express, { Express } from "express";
import rootRouter from "./routes/indexRoute";

const app: Express = express();
const PORT: string | number = process.env.PORT || 5000;

app.use(express.json());

app.use("/", rootRouter);

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
