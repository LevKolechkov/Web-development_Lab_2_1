import { Schema, model, Document } from "mongoose";
import { ILesson } from "./lessonModel";
import { IStudent } from "../interfaces/IStudent";

export interface IComment extends Document {
  student: IStudent["_id"];
  lesson: ILesson["_id"];
  text: string;
}

const commentSchema = new Schema<IComment>({
  student: { type: String, required: true, ref: "Student" },
  lesson: { type: String, required: true, ref: "Lesson" },
  text: { type: String, required: true, maxlength: 255 },
});

export const Comment = model<IComment>("Comment", commentSchema, "comments");
