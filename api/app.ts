import express, { Express } from "express";
import rootRouter from "./routes/index";

const app: Express = express();
const PORT: number | string = process.env.PORT || 5000;

app.use("/", rootRouter);

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
