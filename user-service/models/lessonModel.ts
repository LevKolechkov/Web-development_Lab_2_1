import { Schema, model } from "mongoose";
import { Document } from "mongoose";
import { ICourse } from "../interfaces/ICourse";
import { v4 as uuidv4 } from "uuid";

export interface ILesson extends Document {
  _id: string;
  title: string;
  content?: string;
  videoUrl?: string;
  course: ICourse["_id"];
  order?: number;
  createdAt: string;
}

const lessonSchema = new Schema<ILesson>({
  _id: { type: String, required: true, default: uuidv4() },
  title: { type: String, required: true },
  content: { type: String },
  videoUrl: { type: String },
  course: { type: String, required: true, ref: "Course" },
  order: { type: Number },
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
});

export const Lesson = model<ILesson>("Lesson", lessonSchema, "lessons");
