import mongoose, { Schema } from "mongoose";
import { IResponse } from "../interfaces/IResponse";

const responseSchema = new Schema<IResponse>({
  requestId: { type: String, required: true, unique: true },
  path: { type: String, required: true },
  method: { type: String, required: true },
  status: { type: Number, required: true },
  result: [{ type: String, required: true }],
  error: [{ type: String, default: "" }],
});

export const ResponseLog = mongoose.model<IResponse>(
  "Response",
  responseSchema
);
