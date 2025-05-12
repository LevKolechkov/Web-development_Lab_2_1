import express, { Express } from "express";
import rootRouter from "./routes/indexRoute";
import mongoose from "mongoose";

export const JWT_SECRET: string = process.env.JWT_SECRET || "secret";

const app: Express = express();
const PORT: string | number = process.env.PORT || 5000;
