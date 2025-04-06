import { Schema, model } from "mongoose";

interface IStudent extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  login: string;
  password: string;
  role: string;
}

const studentSchema = new Schema<IStudent>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  login: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
});

export const Student = model<IStudent>("Student", studentSchema, "students");
