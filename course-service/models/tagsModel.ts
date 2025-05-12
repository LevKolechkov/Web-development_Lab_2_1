import { Schema, model } from "mongoose";

interface ITag extends Document {
  name: string;
}

const tagSchema = new Schema<ITag>({
  name: { type: String, required: true, unique: true },
});

export const Tag = model<ITag>("Tag", tagSchema, "tags");
