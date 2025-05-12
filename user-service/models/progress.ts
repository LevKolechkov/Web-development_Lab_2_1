import { Schema, model } from "mongoose";
import { Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IProgress extends Document {
  _id: string;
  studentId: string;
  courseId: string;
  completedLessons: string[];
  progressPercent: number;
}

const progressSchema = new Schema<IProgress>({
  _id: { type: String, required: true, default: uuidv4() },
  studentId: { type: String, required: true, ref: "Student" },
  courseId: { type: String, required: true, ref: "Course" },
  completedLessons: [{ type: String, ref: "Lesson", default: [] }],
  progressPercent: { type: Number, default: 0 },
});

export const Progress = model<IProgress>(
  "Progress",
  progressSchema,
  "progress"
);
