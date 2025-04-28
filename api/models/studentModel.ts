import { Schema, model } from "mongoose";
import { IUser } from "../interfaces/IUser";

export interface IStudent extends IUser {
  favoriteCourses: string[];
}

const studentSchema = new Schema<IStudent>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  login: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  favoriteCourses: [{ type: String, ref: "Course" }],
});

export const Student = model<IStudent>("Student", studentSchema, "students");
