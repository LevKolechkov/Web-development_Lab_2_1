import { Schema, model } from "mongoose";
import { IStudent } from "../interfaces/IStudent";

const studentSchema = new Schema<IStudent>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  login: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  favoriteCourses: [{ type: String, ref: "Course" }],
});

export const Student = model<IStudent>("Student", studentSchema, "students");
