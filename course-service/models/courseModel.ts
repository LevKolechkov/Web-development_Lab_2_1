import { Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { ICourse } from "../interfaces/ICourse";

const courseSchema = new Schema<ICourse>({
  _id: { type: String, required: true, default: uuidv4() },
  title: { type: String, required: true },
  slug: { type: String },
  description: { type: String },
  price: { type: String, required: true },
  image: {
    type: String,
    required: true,
    default: "/uploads/courseDefaultImage.jpeg",
  },
  category: { type: String, required: true },
  level: { type: String, required: true, default: "beginner" },
  published: { type: Boolean, required: true, default: false },
  author: { type: String, required: true },
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
  tags: [{ type: String, ref: "Tag" }],
});

export const Course = model<ICourse>("Course", courseSchema, "courses");
