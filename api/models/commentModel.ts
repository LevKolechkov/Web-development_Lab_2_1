import { Schema, model, Document } from "mongoose";
import { ILesson } from "./lessonModel";
import { IUser } from "../interfaces/IUser";

export interface IComment extends Document {
  user: IUser["_id"];
  lesson: ILesson["_id"];
  text: string;
}

const commentSchema = new Schema<IComment>({
  user: { type: String, required: true, ref: "User" },
  lesson: { type: String, required: true, ref: "Lesson" },
  text: { type: String, required: true, maxlength: 255 },
});

export const Comment = model<IComment>("Comment", commentSchema, "comments");
